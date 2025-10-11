<?php

namespace App\Http\Controllers;

use App\Models\Community;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CommunityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $community = Community::with(["post", "user"])->orderBy("created_at", "DESC")->get();
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $community->map(function($item) {
                return [
                    "id" => $item->id,
                    "name" => $item->name,
                    "desc" => $item->desc,
                    "image" => $item->image,
                    "post" => $item->post->map(function($post) {
                        return [
                            "id" => $post->id,
                            "user_id" => $post->user_id,
                            "community_id" => $post->community_id,
                            "message" => $post->message,
                            "image" => $post->image,
                            "user" => $post->user,
                            "created_at" => $post->created_at,
                            "updated_at" => $post->updated_at,
                        ];
                    }),
                    "user" => $item->user,
                    "created_at" => $item->created_at,
                    "updated_at" => $item->updated_at,
                ];
            })
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
        $validateData = Validator::make($request->all(), [
            "name" => "required",
            "image" => "required|mimes:jpg,jpeg,png,web",
            "desc" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        $file = Storage::disk("public")->putFile("community", $request->image);
        $community = Community::create([
            "name" => $request->name,
            "desc" => $request->desc,
            "image" => $file,
        ]);
        return response()->json([
            "message" => "Data Berhasil Ditambah!",
            "data" => $community
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $community = Community::with(["post"])->find($id);
        if (!$community) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => [
                "id" => $community->id,
                "name" => $community->name,
                "desc" => $community->desc,
                "image" => $community->image,
                "post" => $community->post->map(function($post) {
                    return [
                        "id" => $post->id,
                        "user_id" => $post->user_id,
                        "community_id" => $post->community_id,
                        "message" => $post->message,
                        "image" => $post->image,
                        "user" => $post->user,
                        "created_at" => $post->created_at,
                        "updated_at" => $post->updated_at,
                    ];
                }),
                "user" => $community->user,
                "created_at" => $community->created_at,
                "updated_at" => $community->updated_at,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $community = Community::find($id);
        if (!$community) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($request->hasFile("image")) {
            if ($community->image) {
                Storage::disk()->delete($community->image);
            }

            $file = Storage::disk("public")->putFile("community", $request->image, "public");
            $community->image = $file ?? $community->image;
        }

        $community->name = $request->name ?? $community->name;
        $community->desc = $request->desc ?? $community->desc;
        $community->save();

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $community
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $community = Community::find($id);
        if (!$community) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        Storage::disk("public")->delete($community->image);
        $community->delete();
        return response()->json([
            "message" => "Data Berhasil Dihapus!",
            "data" => $community
        ], 200);
    }
}
