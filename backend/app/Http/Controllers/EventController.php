<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $event = Event::orderBy("created_at", "DESC")->get();
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $event
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
            "location" => "required",
            "date" => "required",
            "price" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        $file = Storage::disk("public")->putFile("event", $request->image);
        $event = Event::create([
            "title" => $request->title,
            "desc" => $request->desc,
            "detail" => $request->detail,
            "image" => $file,
            "location" => $request->location,
            "date" => $request->date,
            "price" => $request->price,
        ]);
        return response()->json([
            "message" => "Data Berhasil Ditambah!",
            "data" => $event
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $event
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
        $event = Event::find($id);
        if (!$event) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($request->hasFile("image")) {
            if ($event->image) {
                Storage::disk()->delete($event->image);
            }

            $file = Storage::disk("public")->putFile("event", $request->image, "public");
            $event->image = $file ?? $event->image;
        }

        $event->title = $request->title ?? $event->title;
        $event->desc = $request->desc ?? $event->desc;
        $event->detail = $request->detail ?? $event->detail;
        $event->location = $request->location ?? $event->location;
        $event->date = $request->date ?? $event->date;
        $event->price = $request->price ?? $event->price;
        $event->save();

        return response()->json([
            "message" => "Data Berhasil Diubah!",
            "data" => $event
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        Storage::disk("public")->delete($event->image);
        $event->delete();
        return response()->json([
            "message" => "Data Berhasil Dihapus!",
            "data" => $event
        ], 200);
    }
}
