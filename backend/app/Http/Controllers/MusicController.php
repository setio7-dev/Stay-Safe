<?php

namespace App\Http\Controllers;

use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MusicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $music = Music::orderBy("created_at", "DESC")->get();
        return response()->json([
            "data" => $music,
            "message" => "Data Berhasil Diambil!"
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
            "image" => "required|mimes:jpg,jpeg,png,web",
            "song" => "required",
            "author" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "data" => null,
                "message" => "Data Harus Diisi!",
            ], 422);
        }

        $image = Storage::disk("public")->putFile("meditation/music", $request->image);
        $song = Storage::disk("public")->putFile("meditation/music", $request->song);

        $music = Music::create([
            "title" => $request->title,
            "image" => $image,
            "song" => $song,
            "author" => $request->author
        ]);

        return response()->json([
            "data" => $music,
            "message" => "Data Berhasil Ditambah!"
        ], 201);   
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $music = Music::find($id);
        if (!$music) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        return response()->json([
            "data" => $music,
            "message" => "Data Berhasil Diambil!"
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
        $music = Music::find($id);
        if (!$music) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        if ($request->hasFile("image")) {
            if ($music->image) {
                Storage::disk("public")->delete($music->image);
            }

            $image = Storage::disk("public")->putFile("meditation/music", $request->image);
            $music->image = $image ?? $music->image;
        }

        if ($request->hasFile("song")) {
            if ($music->song) {
                Storage::disk("public")->delete($music->song);
            }

            $song = Storage::disk("public")->putFile("meditation/music", $request->song);            
            $music->song = $song ?? $music->song;
        }

        $music->title = $request->title ?? $music->title;
        $music->author = $request->author ?? $music->author;
        $music->save();

        return response()->json([
            "data" => $music,
            "message" => "Data Berhasil Diubah!"
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $music = Music::find($id);
        if (!$music) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }
        
        Storage::disk("public")->delete($music->image);
        Storage::disk("public")->delete($music->song);

        $music->delete();
        return response()->json([
            "data" => $music,
            "message" => "Data Berhasil Dihapus!"
        ]);
    }
}
