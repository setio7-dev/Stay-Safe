<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $news = News::orderBy("created_at", "DESC")->get();
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $news
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
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        $file = Storage::disk("public")->putFile("news", $request->image);
        $news = News::create([
            "title" => $request->title,
            "desc" => $request->desc,
            "detail" => $request->detail,
            "image" => $file,
        ]);
        return response()->json([
            "message" => "Data Berhasil Ditambah!",
            "data" => $news
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $news = News::find($id);
        if (!$news) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $news
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
        $news = News::find($id);
        if (!$news) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($request->hasFile("image")) {
            if ($news->image) {
                Storage::disk()->delete($news->image);
            }

            $file = Storage::disk("public")->putFile("news", $request->image, "public");
            $news->image = $file ?? $news->image;
        }

        $news->title = $request->title ?? $news->title;
        $news->desc = $request->desc ?? $news->desc;
        $news->detail = $request->detail ?? $news->detail;
        $news->save();

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $news
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $news = News::find($id);
        if (!$news) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        Storage::disk("public")->delete($news->image);
        $news->delete();
        return response()->json([
            "message" => "Data Berhasil Dihapus!",
            "data" => $news
        ], 200);
    }
}
