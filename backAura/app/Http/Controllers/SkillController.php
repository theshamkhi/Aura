<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class SkillController extends Controller
{
    /**
     * Display a listing of skills for the current portfolio
     */
    public function index(Portfolio $portfolio)
    {
        $skills = $portfolio->skills()->latest()->get();
        return response()->json([
            'status' => 'success',
            'skills' => $skills
        ]);
    }

    /**
     * Store a newly created skill for the current portfolio
     */
    public function store(Request $request)
    {
        $portfolio = Auth::user()->portfolio;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                Rule::unique('skills')->where('portfolio_id', $portfolio->id)
            ],
            'icon' => 'nullable|string'
        ]);

        $skill = $portfolio->skills()->create($validated);

        return response()->json([
            'status' => 'success',
            'skill' => $skill
        ], 201);
    }

    /**
     * Update existing skill
     */
    public function update(Request $request, Skill $skill)
    {
        if ($skill->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                Rule::unique('skills')->ignore($skill->id)->where('portfolio_id', $skill->portfolio_id)
            ],
            'icon' => 'nullable|string'
        ]);

        $skill->update($validated);
        return response()->json([
            'status' => 'success',
            'skill' => $skill
        ]);
    }

    /**
     * Attach skill to project
     */
    public function attachToProject(Request $request, Skill $skill)
    {
        if ($skill->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id,portfolio_id,'.$skill->portfolio_id
        ]);

        $skill->projects()->syncWithoutDetaching([$validated['project_id']]);
        return response()->json([
            'status' => 'success',
            'message' => 'Skill attached to project'
        ]);
    }

    /**
     * Detach skill from project
     */
    public function detachFromProject(Request $request, Skill $skill)
    {
        if ($skill->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id,portfolio_id,'.$skill->portfolio_id
        ]);

        $skill->projects()->detach($validated['project_id']);
        return response()->json(['status' => 'success', 'message' => 'Skill detached from project']);
    }

    /**
     * Remove the specified skill from the current portfolio
     */
    public function destroy(Skill $skill)
    {   
        if ($skill->portfolio_id !== Auth::user()->portfolio->id) {
            abort(403, 'Unauthorized action.');
        }

        $skill->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Skill deleted successfully'
        ]);
    }
}