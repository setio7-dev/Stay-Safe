<?php

namespace App\Http\Controllers;

use App\Models\Meditation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MeditationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meditation = Meditation::orderBy("created_at", "DESC")->get();
        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $meditation
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
            "title" => "required",
            "thumbnail" => "required|mimes:jpg,jpeg,png,web",
            "video" => "required|mimes:mp4",
            "desc" => "required",
            "detail" => "required",
            "author" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        $thumbnail = Storage::disk("public")->putFile("meditation/video", $request->thumbnail);
        $video = Storage::disk("public")->putFile("meditation/video", $request->video);

        $meditation = Meditation::create([
            "title" => $request->title,
            "desc" => $request->desc,
            "detail" => $request->detail,
            "author" => $request->author,
            "video" => $video,
            "thumbnail" => $thumbnail
        ]);

        return response()->json([
            "message" => "Data Berhasil Ditambah!",
            "data" => $meditation
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $meditation = Meditation::find($id);
        if (!$meditation) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $meditation
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
        $meditation = Meditation::find($id);
        if (!$meditation) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($request->hasFile("thumbnail")) {
            if ($meditation->thumbnail) {
                Storage::disk()->delete($meditation->thumbnail);
            }

            $file = Storage::disk("public")->putFile("meditation/video", $request->thumbnail, "public");
            $meditation->thumbnail = $file ?? $meditation->thumbnail;
        }

        if ($request->hasFile("video")) {
            if ($meditation->video) {
                Storage::disk()->delete($meditation->video);
            }

            $file = Storage::disk("public")->putFile("meditation/video", $request->video, "public");
            $meditation->video = $file ?? $meditation->video;
        }

        $meditation->title = $request->title ?? $meditation->title;
        $meditation->author = $request->author ?? $meditation->author;
        $meditation->desc = $request->desc ?? $meditation->desc;
        $meditation->detail = $request->detail ?? $meditation->detail;
        $meditation->save();

        return response()->json([
            "message" => "Data Berhasil Diubah!",
            "data" => $meditation
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $meditation = Meditation::find($id);
        if (!$meditation) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        Storage::disk()->delete($meditation->thumbnail);
        Storage::disk()->delete($meditation->video);
        $meditation->delete();

        return response()->json([
            "message" => "Data Berhasil Dihapus!",
            "data" => $meditation
        ]);
    }
}
