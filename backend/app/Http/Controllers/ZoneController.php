<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ZoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $zone = Zone::all();
        return response()->json([
            "data" => $zone,
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
            "name" => "required",
            "latitude" => "required",
            "longitude" => "required",
            "radius" => "required",
            "category" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "data" => null,
                "message" => "Data Harus Diisi!"
            ], 422);
        }

        $zone = Zone::create($request->all());
        return response()->json([
            "data" => $zone,
            "message" => "Data Berhasil Ditambah!"
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $zone = Zone::find($id);
        if (!$zone) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        return response()->json([
            "data" => $zone,
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
        $zone = Zone::find($id);
        if (!$zone) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        $zone->update([
            "name" => $request->name ?? $zone->name,
            "latitude" => $request->latitude ?? $zone->latitude,
            "longitude" => $request->longitude ?? $zone->longitude,
            "radius" => $request->radius ?? $zone->radius,
            "category" => $request->category ?? $zone->category,
        ]);

        return response()->json([
            "data" => $zone,
            "message" => "Data Berhasil Diubah!"
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $zone = Zone::find($id);
        if (!$zone) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        $zone->delete();
        return response()->json([
            "data" => $zone,
            "message" => "Data Berhasil Dihapus!"
        ]);
    }
}
