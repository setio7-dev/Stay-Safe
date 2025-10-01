<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CommunityPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $community = CommunityPost::orderBy("created_at", "DESC")->get();
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $community
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $validateData = Validator::make($request->all(), [
            "community_id" => "required",
            "image" => "mimes:jpg,jpeg,png,web",
            "message" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        if ($request->hasFile("image")) {
            $file = Storage::disk("public")->putFile("community/post", $request->image);
        }
        
        $community = CommunityPost::create([
            "user_id" => $user->id,
            "message" => $request->message,
            "image" => $file ?? null,
            "community_id" => $request->community_id
        ]);

        return response()->json([
            "message" => "Data Berhasil Ditambah!",
            "data" => $community
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $community = CommunityPost::find($id);

        if (!$community) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($user->role == "admin") {
            Storage::disk("public")->delete($community->image);
            $community->delete();
            return response()->json([
                "message" => "Data Berhasil Dihapus!",
                "data" => $community
            ], 200);
        } else if ($user->role == "guest") {
            if ($user->id == $community->user_id) {
                Storage::disk("public")->delete($community->image);
                $community->delete();
                return response()->json([
                    "message" => "Data Berhasil Dihapus!",
                    "data" => $community
                ], 200);
            }

            return response()->json([
                "message" => "Data Tidak Berhasil Dihapus!",
                "data" => $community
            ], 403);
        }
    }
}
