<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    // List all active plants (for customers)
    public function index()
    {
        $plants = Plant::where('is_active', true)->latest()->get();

        return response()->json([
            'plants' => $plants
        ]);
    }

    // Show single plant
    public function show($id)
    {
        $plant = Plant::findOrFail($id);

        return response()->json([
            'plant' => $plant
        ]);
    }

    // Admin: create plant
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'scientific_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'light' => ['nullable', 'string', 'max:100'],
            'water' => ['nullable', 'string', 'max:100'],
            'soil' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $plant = Plant::create($validated);

        return response()->json([
            'message' => 'Plant added successfully',
            'plant' => $plant
        ], 201);
    }

    // Admin: update plant
    public function update(Request $request, $id)
    {
        $plant = Plant::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'scientific_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'light' => ['nullable', 'string', 'max:100'],
            'water' => ['nullable', 'string', 'max:100'],
            'soil' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $plant->update($validated);

        return response()->json([
            'message' => 'Plant updated successfully',
            'plant' => $plant
        ]);
    }

    // Admin: delete plant
    public function destroy($id)
    {
        $plant = Plant::findOrFail($id);
        $plant->delete();

        return response()->json([
            'message' => 'Plant deleted successfully'
        ]);
    }
}
