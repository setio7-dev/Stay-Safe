<?php

namespace App\Http\Controllers;

use App\Models\CommunityMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommunityMemberController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->community()->where('community_id', $request->community_id)->exists()) {
        return response()->json([
                'message' => 'Pengguna Sudah Bergabung',
                'data' => null
            ], 422);
        }

        $user->community()->attach($request->community_id);

        return response()->json([
            'message' => "Pengguna Berhasil Bergabung!",
            "data" => null
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();
        $user->community()->detach($request->community_id);

        return response()->json([
            'message' => "Pengguna Berhasil Keluar!",
            "data" => null
        ], 201);
    }
}
