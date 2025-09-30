<?php

namespace App\Http\Controllers;

use App\Models\EventTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EventTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transaction = EventTransaction::with(["user", "event"])->get();
        return response()->json([
            "data" => $transaction,
            "message" => "Data Berhasil Diambil!"
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $validateData = Validator::make($request->all(), [
            "event_id" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "data" => null,
                "message" => "Data Harus Diisi!",
            ], 422);
        }

        $transaction = EventTransaction::create([
            "user_id" => $user->id,
            "event_id" => $request->event_id
        ]);
        return response()->json([
            "data" => $transaction,
            "message" => "Data Berhasil Ditambah!"
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $transaction = EventTransaction::with(["user", "event"])->find($id);
        if (!$transaction) {
            return response()->json([
                "data" => null,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        return response()->json([
            "data" => $transaction,
            "message" => "Data Berhasil Diambil!"
        ]);
    }
}
