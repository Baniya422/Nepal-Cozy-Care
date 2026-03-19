<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeasonalReminder;
use Illuminate\Http\Request;

class SeasonalReminderController extends Controller
{
    public function current(Request $request)
    {
        $seasonKey = SeasonalReminder::currentSeasonKey();
        $city = $request->query('city');

        $reminders = SeasonalReminder::with('careTip:id,title,excerpt,image,category')
            ->published()
            ->forSeason($seasonKey)
            ->forCity($city)
            ->orderByDesc('priority')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'season_key' => $seasonKey,
                'season_label' => SeasonalReminder::seasonLabels()[$seasonKey] ?? ucfirst($seasonKey),
                'city' => $city,
                'reminders' => $reminders,
            ],
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = SeasonalReminder::with([
            'author:id,name,email',
            'careTip:id,title,category',
        ])->latest();

        if ($season = $request->query('season_key')) {
            $query->where('season_key', $season);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('city', 'like', '%' . $search . '%')
                    ->orWhere('excerpt', 'like', '%' . $search . '%')
                    ->orWhere('content', 'like', '%' . $search . '%');
            });
        }

        $reminders = $query->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'message' => null,
            'data' => [
                'reminders' => $reminders->items(),
                'seasons' => SeasonalReminder::seasonLabels(),
                'pagination' => [
                    'current_page' => $reminders->currentPage(),
                    'per_page' => $reminders->perPage(),
                    'total' => $reminders->total(),
                    'last_page' => $reminders->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'image' => 'nullable|string|max:255',
            'season_key' => 'required|in:all,spring,summer,monsoon,autumn,winter',
            'city' => 'nullable|string|max:120',
            'priority' => 'nullable|integer|min:0|max:100',
            'care_tip_id' => 'nullable|exists:care_tips,id',
            'is_published' => 'boolean',
        ]);

        $reminder = SeasonalReminder::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'priority' => $validated['priority'] ?? 0,
            'is_published' => (bool) ($validated['is_published'] ?? false),
        ]);

        return response()->json([
            'message' => 'Seasonal reminder created successfully',
            'data' => [
                'reminder' => $reminder->load(['author:id,name,email', 'careTip:id,title,category']),
            ],
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $reminder = SeasonalReminder::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|string',
            'image' => 'nullable|string|max:255',
            'season_key' => 'sometimes|in:all,spring,summer,monsoon,autumn,winter',
            'city' => 'nullable|string|max:120',
            'priority' => 'nullable|integer|min:0|max:100',
            'care_tip_id' => 'nullable|exists:care_tips,id',
            'is_published' => 'boolean',
        ]);

        $reminder->update($validated);

        return response()->json([
            'message' => 'Seasonal reminder updated successfully',
            'data' => [
                'reminder' => $reminder->fresh(['author:id,name,email', 'careTip:id,title,category']),
            ],
        ]);
    }

    public function destroy(int $id)
    {
        $reminder = SeasonalReminder::findOrFail($id);
        $reminder->delete();

        return response()->json([
            'message' => 'Seasonal reminder deleted successfully',
        ]);
    }
}
