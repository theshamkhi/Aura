<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

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
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category' => 'required|string|max:255',
            'date' => 'required|date',
            'source_code_url' => 'nullable|url',
            'live_site_url' => 'nullable|url',
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
        $data['slug'] = Str::slug($request->title);
        // $data['portfolio_id'] = 1;
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('projects', 'public');
            $data['image'] = $path;
        }

        $project = Project::create($data);

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
     * Update the specified project.
     */
    public function update(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'source_code_url' => 'nullable|url',
            'live_site_url' => 'nullable|url',
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
        
        if ($request->has('title')) {
            $data['slug'] = Str::slug($request->title);
        }

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

    /**
     * Increment project view count
     */
    public function incrementViews(Project $project)
    {
        $project->increment('view_count');
        
        return response()->json([
            'status' => 'success',
            'view_count' => $project->view_count
        ]);
    }
}