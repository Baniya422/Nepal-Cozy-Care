# Test Case Code References

## Test 1 - Login with Invalid Credentials

### Backend validation
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:44`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:53`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:54`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:55`

### Frontend request + error handling
- `Nepal-Cozy-Care-frontend/src/pages/Login.tsx:43`
- `Nepal-Cozy-Care-frontend/src/pages/Login.tsx:53`
- `Nepal-Cozy-Care-frontend/src/pages/Login.tsx:64`
- `Nepal-Cozy-Care-frontend/src/pages/Login.tsx:65`
- `Nepal-Cozy-Care-frontend/src/pages/Login.tsx:76`
- `Nepal-Cozy-Care-frontend/src/pages/Login.tsx:108`

### Automated test
- `Nepal-Cozy-Care-backend/tests/Feature/AuthRegistrationLoginTest.php:54`
- `Nepal-Cozy-Care-backend/tests/Feature/AuthRegistrationLoginTest.php:61`
- `Nepal-Cozy-Care-backend/tests/Feature/AuthRegistrationLoginTest.php:64`
- `Nepal-Cozy-Care-backend/tests/Feature/AuthRegistrationLoginTest.php:65`

## Test 3 - User Registration with Missing Fields

### Frontend validation
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:26`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:27`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:28`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:29`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:30`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:31`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:32`

### Frontend submit blocking + error display
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:49`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:54`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:55`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:56`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:57`
- `Nepal-Cozy-Care-frontend/src/pages/Register.tsx:127`

### Backend required-field validation
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:22`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:24`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:25`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:26`
- `Nepal-Cozy-Care-backend/app/Http/Controllers/Api/AuthController.php:27`

## Screenshot Recommendation

- For each test case, include one backend code screenshot, one frontend code screenshot, and one result screenshot from the app or test evidence.
- If your lecturer asks for proof of automated testing too, use the backend test file references above.
