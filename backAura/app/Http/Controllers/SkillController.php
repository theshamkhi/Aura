<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SkillController extends Controller
{
    /**
     * Display a listing of skills.
    */
    public function index()
    {
        $skills = Skill::latest()->get();
        return response()->json([
            'status' => 'success',
            'skills' => $skills
        ]);
    }

    /**
     * Store a newly created skill.
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:skills',
            'icon' => 'nullable|string|max:255',
            'portfolio_id' => 'required|exists:portfolios,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $skill = Skill::create($request->all());

        return response()->json([
            'status' => 'success',
            'skill' => $skill
        ], 201);
    }

    /**
     * Display the specified skill.
    */
    public function show(Skill $skill)
    {
        return response()->json([
            'status' => 'success',
            'skill' => $skill->load('projects')
        ]);
    }

    /**
     * Update the specified skill.
    */
    public function update(Request $request, Skill $skill)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:skills,name,'.$skill->id,
            'icon' => 'nullable|string|max:255',
            'portfolio_id' => 'sometimes|exists:portfolios,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $skill->update($request->all());

        return response()->json([
            'status' => 'success',
            'skill' => $skill
        ]);
    }

    /**
     * Remove the specified skill.
    */
    public function destroy(Skill $skill)
    {
        $skill->projects()->detach();
        
        $skill->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Skill deleted successfully'
        ]);
    }

    /**
     * Attach skill to a project
    */
    public function attachToProject(Request $request, Skill $skill)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $skill->projects()->syncWithoutDetaching([$request->project_id]);

        return response()->json([
            'status' => 'success',
            'message' => 'Skill attached to project successfully',
            'project' => Project::with('skills')->find($request->project_id)
        ]);
    }

    /**
     * Detach skill from a project
    */
    public function detachFromProject(Request $request, Skill $skill)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $skill->projects()->detach($request->project_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Skill detached from project successfully'
        ]);
    }

    /**
     * Get all projects that use this skill
    */
    public function projects(Skill $skill)
    {
        $projects = $skill->projects()->with('skills')->get();

        return response()->json([
            'status' => 'success',
            'projects' => $projects
        ]);
    }
}