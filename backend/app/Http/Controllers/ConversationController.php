<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $conversation = Conversation::with(["senders", "receivers", "message"])->get();
        
        $conversation->each(function ($conv) use ($user) {
        if ($user->role === "guest") {
            $conv->unread_count = $conv->message->where("receiver", $conv->receiver)->where("isread", "false")->count();
        } elseif ($user->role === "doctor") {
            $conv->unread_count = $conv->message->where("sender", $conv->sender)->where("isread", "false")->count();
        } else {
            $conv->unread_count = 0;
            }
        });
                        
        return response()->json([
            "data" => $conversation->map(function ($item) {
                $doctor = Doctor::where('user_id', $item->receivers->id)->first();
                return [
                    'id' => $item->id,
                    "unread_count" => $item->unread_count,
                    'sender' => $item->senders,
                    'receiver' =>  [
                        "id" => $item->receivers->id,
                        "name" => $item->receivers->name,
                        "email" => $item->receivers->email,
                        "image" => $item->receivers->image,
                        "category" => $doctor->category,
                        "created_at" => $item->receivers->created_at,
                        "updated_at" => $item->receivers->updated_at,
                    ],
                    'message' => $item->message,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            }),
            "message" => "Data Berhasil Diambil!"
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $sender = Auth::user();
        $receiver = Conversation::where("receiver", $request->receiver)->where("sender", $sender->id)->first();
        if ($receiver) {
            return response()->json([
                "data" => null,
                "message" => "Konsultasi Ini Sudah Ada!"
            ], 422);
        }

        $conversation = Conversation::create([
            "sender" => $sender->id,
            "receiver" => $request->receiver
        ]);

        return response()->json([
            "data" => $conversation,
            "message" => "Data Berhasil Dibuat!"
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $conversation = Conversation::with(["sender", "receiver"])->find($id);
        if (!$conversation) {
            return response()->json([
                "data" => $conversation,
                "message" => "Data Tidak Ditemukan!"
            ], 404);
        }

        return response()->json([
            "data" => $conversation,
            "message" => "Data Berhasil Diambil!"
        ]);
    }
}
