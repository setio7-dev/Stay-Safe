<?php

namespace App\Http\Controllers;

use App\Models\FactDetection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FactDetectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fact = FactDetection::all();
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $fact
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
            "desc" => "required",
            "detail" => "required",
            "category" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        $file = Storage::disk("public")->putFile("fact", $request->image);
        $fact = FactDetection::create([
            "title" => $request->title,
            "desc" => $request->desc,
            "detail" => $request->detail,
            "category" => $request->category,
            "image" => $file,
        ]);
        return response()->json([
            "message" => "Data Berhasil Ditambah!",
            "data" => $fact
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $fact = FactDetection::find($id);
        if (!$fact) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $fact
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
        $fact = FactDetection::find($id);
        if (!$fact) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($request->hasFile("image")) {
            if ($fact->image) {
                Storage::disk()->delete($fact->image);
            }

            $file = Storage::disk("public")->putFile("fact", $request->image, "public");
            $fact->image = $file ?? $fact->image;
        }

        $fact->title = $request->title ?? $fact->title;
        $fact->desc = $request->desc ?? $fact->desc;
        $fact->category = $request->category ?? $fact->category;
        $fact->detail = $request->detail ?? $fact->detail;
        $fact->save();

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $fact
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $fact = FactDetection::find($id);
        if (!$fact) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        Storage::disk("public")->delete($fact->image);
        $fact->delete();
        return response()->json([
            "message" => "Data Berhasil Dihapus!",
            "data" => $fact
        ], 200);
    }
}
