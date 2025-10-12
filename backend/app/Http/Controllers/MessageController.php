<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(string $conversationID) 
    {
        $user = Auth::user();
        $message = Message::where("conversation_id", $conversationID)->with(["sender", "conversation"])->get();

        foreach ($message as $item) {
            if ($item->sender != $user->id) {
                $item->update([
                    "isread" => "true"
                ]);
            }
        }

        return response()->json([
            "message" => "Data Berhasil Diambil!",
            "data" => $message
        ]);   
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $validateData = Validator::make($request->all(), [
            "conversation_id" => "required",
            "message" => "required",
        ]);

        if ($validateData->fails()) {
            return response()->json([
                "message" => "Data Harus Diisi!",
                "data" => null,
            ], 422);
        }

        if ($request->hasFile("image")) {
            $file = Storage::disk("public")->putFile("message", $request->image);
        }

        $message = Message::create([
            "conversation_id" =>$request->conversation_id,
            "sender" => $user->id,
            "message" => $request->message,
            "image" => $file ?? null,
            "isread" => "false"
        ]);

        return response()->json([
            "message" => "Data Berhasil Ditambahkan!",
            "data" => $message
        ], 201);
    }

    public function destroy(string $id)
    {
        $user = Auth::user();
        $message = Message::with(["sender", "conversation"])->find($id);

        if (!$message) {
            return response()->json([
                "message" => "Data Tidak Ditemukan!",
                "data" => null
            ], 404);
        }

        if ($message->sender != $user->id) {
            return response()->json([
                "message" => "Data Tidak Bisa Dihapus!",
                "data" => null
            ], 422);
        }

        if ($message->image) {
            Storage::disk("public")->delete($message->image);
        }

        $message->delete();
        return response()->json([
            "message" => "Data Berhasil Dihapus!",
            "data" => null
        ], 200);
    }
}
