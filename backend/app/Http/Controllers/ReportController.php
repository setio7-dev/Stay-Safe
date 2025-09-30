<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $report = Report::orderBy("created_at", "DESC")->get();
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $report
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
            "category" => "required",
            "image" => "required|mimes:jpg,jpeg,png,web",
            "message" => "required",
            "location" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null
            ], 422);
        }

        $file = Storage::disk("public")->putFile("report", $request->image);
        $report = Report::create([
            "category" => $request->category,
            "message" => $request->message,
            "location" => $request->location,
            "image" => $file,
        ]);
        return response()->json([
            "message" => "Laporan Berhasil!",
            "data" => $report
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $report = Report::find($id);
        if (!$report) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $report
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
