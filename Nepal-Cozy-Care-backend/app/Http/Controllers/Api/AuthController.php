<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PasswordResetCodeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const PASSWORD_RESET_CODE_LENGTH = 6;
    private const PASSWORD_RESET_TTL_MINUTES = 10;

    // for user registration
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'customer',
        ]);

        return response()->json([
            'message' => 'Account created successfully. You can now log in.',
            'user' => $user,
        ], 201);
    }

    // for user login
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // SEND PASSWORD RESET CODE
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $delivery = $this->sendPasswordResetCode($user);

            return response()->json([
                'message' => $delivery['message'],
                'delivery_method' => $delivery['delivery_method'],
                'development_code' => $delivery['development_code'],
            ]);
        }

        return response()->json([
            'message' => 'If an account exists for that email, a password reset code has been sent.',
            'delivery_method' => 'silent',
            'development_code' => null,
        ]);
    }

    // RESET PASSWORD USING 6-DIGIT CODE
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'digits:'.self::PASSWORD_RESET_CODE_LENGTH],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Invalid reset request.'],
            ]);
        }

        $resetEntry = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        $createdAt = $resetEntry?->created_at ? Carbon::parse($resetEntry->created_at) : null;
        $isExpired = ! $resetEntry
            || ! $createdAt
            || $createdAt->addMinutes(self::PASSWORD_RESET_TTL_MINUTES)->isPast();

        $isInvalid = ! $resetEntry || ! Hash::check($validated['code'], $resetEntry->token);

        if ($isExpired || $isInvalid) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired reset code. Please request a new one.'],
            ]);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->delete();

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully. You can now log in with your new password.',
        ]);
    }

    // for user logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    // LOGOUT ALL DEVICES
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices',
        ]);
    }

    // CURRENT USER
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    // UPDATE CURRENT USER PROFILE
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    // UPDATE PASSWORD AND ROTATE TOKENS
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Password updated successfully',
            'user' => $user->fresh(),
            'token' => $token,
        ]);
    }

    private function sendPasswordResetCode(User $user): array
    {
        $code = $this->generateNumericCode(self::PASSWORD_RESET_CODE_LENGTH);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        return $this->sendAuthMail(
            $user,
            new PasswordResetCodeNotification($code, self::PASSWORD_RESET_TTL_MINUTES),
            'password reset email',
            $code,
            'If an account exists for that email, a password reset code has been sent.',
            'If an account exists for that email, the reset code is shown below for local development.'
        );
    }

    private function generateNumericCode(int $length): string
    {
        return (string) random_int(
            (int) str_pad('1', $length, '0'),
            (int) str_pad('', $length, '9')
        );
    }

    private function sendAuthMail(
        User $user,
        object $notification,
        string $mailPurpose,
        string $code,
        string $successMessage,
        string $previewMessage
    ): array
    {
        try {
            $user->notify($notification);

            return [
                'message' => $successMessage,
                'delivery_method' => 'email',
                'development_code' => null,
            ];
        } catch (\Throwable $exception) {
            Log::error('Failed to send auth mail.', [
                'purpose' => $mailPurpose,
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);

            if (app()->environment('local')) {
                return [
                    'message' => $previewMessage,
                    'delivery_method' => 'preview',
                    'development_code' => $code,
                ];
            }

            throw ValidationException::withMessages([
                'email' => ['Email service is not configured correctly yet. Add valid Gmail SMTP credentials and try again.'],
            ]);
        }
    }
}
