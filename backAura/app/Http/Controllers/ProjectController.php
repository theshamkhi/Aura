<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
    */
    public function index()
    {
        $projects = Project::with('skills')->latest()->get();
        return response()->json([
            'status' => 'success',
            'projects' => $projects
        ]);
    }

    /**
     * Show the form for creating a new resource.
    */
    public function create()
    {
        //
    }

    /**
     * Store a newly created project.
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category' => 'required|string|max:255',
            'date' => 'required|date',
            'sourceCodeLink' => 'nullable|url',
            'liveSiteLink' => 'nullable|url',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id',
            'portfolio_id' => 'required|exists:portfolios,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image', 'skills');
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('projects', 'public');
            $data['image'] = $path;
        }

        $project = Project::create($data);

        // Attach skills if provided
        if ($request->has('skills')) {
            $project->skills()->attach($request->skills);
        }

        return response()->json([
            'status' => 'success',
            'project' => $project->load('skills')
        ], 201);
    }

    /**
     * Display the specified project.
    */
    public function show(Project $project)
    {
        return response()->json([
            'status' => 'success',
            'project' => $project->load('skills')
        ]);
    }

    /**
     * Show the form for editing the specified resource.
    */
    public function edit(Project $project)
    {
        //
    }

    /**
     * Update the specified project.
    */
    public function update(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'sourceCodeLink' => 'nullable|url',
            'liveSiteLink' => 'nullable|url',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image', 'skills');
        
        if ($request->hasFile('image')) {

            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            
            $path = $request->file('image')->store('projects', 'public');
            $data['image'] = $path;
        }

        $project->update($data);

        if ($request->has('skills')) {
            $project->skills()->sync($request->skills);
        }

        return response()->json([
            'status' => 'success',
            'project' => $project->fresh()->load('skills')
        ]);
    }

    /**
     * Remove the specified project.
    */
    public function destroy(Project $project)
    {
        // Delete associated image if exists
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }

        $project->skills()->detach();
        
        $project->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Project deleted successfully'
        ]);
    }

    /**
     * Filter projects by category
    */
    public function filterByCategory($category)
    {
        $projects = Project::with('skills')
            ->where('category', $category)
            ->get();

        return response()->json([
            'status' => 'success',
            'projects' => $projects
        ]);
    }

    /**
     * Filter projects by technology (skill)
    */
    public function filterByTechnology(Skill $skill)
    {
        $projects = $skill->projects()->with('skills')->get();

        return response()->json([
            'status' => 'success',
            'projects' => $projects
        ]);
    }
}
