<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $doctor = Doctor::with("user")->orderBy("created_at", "DESC")->get();
        return response()->json([
            "data" => $doctor,
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
            "user_id" => "required",
            "category" => "required",
            "hospital" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "data" => null,
                "message" => "Data Harus Diisi!"
            ], 422);
        }

        $user = User::find($request->user_id);
        $user->update([
            "role" => "doctor"
        ]);
        
        $doctor = Doctor::create($request->all());
        return response()->json([
            "data" => $doctor,
            "message" => "Data Berhasil Ditambah!"
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $doctor = Doctor::with("user")->find($id);
        if (!$doctor) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        return response()->json([
            "data" => $doctor,
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
        $doctor = Doctor::find($id);
        if (!$doctor) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        $doctor->update([
            "user_id" => $request->user_id ?? $doctor->user_id,
            "category" => $request->category ?? $doctor->category,
            "hospital" => $request->hospital ?? $doctor->hospital,
        ]);

        return response()->json([
            "data" => $doctor,
            "message" => "Data Berhasil Diubah!"
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        $user = User::find($doctor->user_id);
        $user->update([
            "role" => "guest"
        ]);

        $doctor->delete();
        return response()->json([
            "data" => $doctor,
            "message" => "Data Berhasil Dihapus!"
        ]);
    }
}
