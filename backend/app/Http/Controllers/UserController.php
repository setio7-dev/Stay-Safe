<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class UserController extends Controller
{
    public function allUser()
    {
        $user = User::all();
        return response()->json([
            'message' => 'Data Berhasil Diambil!',
            'data' => $user
        ], 201);
    }

    public function register(Request $request)
    {
        $validateData = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required',
            'password' => 'required',
        ]);

        $email = User::where('email', $request->email)->first();
        if ($email) {
            return response()->json([
                'message' => 'Email Sudah Terdaftar!',
                'data' => null
            ], 422);
        }

        if ($validateData->fails()) {
            return response()->json([
                'message' => 'Data Harus Diisi!',
                'data' => null
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'guest',
            'warning_widget' => 'false'
        ]);

        return response()->json([
            'message' => 'Daftar Berhasil!',
            'data' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $validateData = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ]);

        if ($validateData->fails()) {
            return response()->json([
                'message' => 'Data Harus Diisi!',
                'data' => null
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email / Kata Sandi Salah!',
                'data' => null
            ], 422);
        }

        $token = $user->createToken('access_token')->plainTextToken;
        return response()->json([
            'message' => "Masuk Berhasil!",
            "data" => [
                "user" => $user,
                "token" => $token
            ]
        ]);
    }

    public function me() 
    {
        $user = User::with('community')->find(Auth::id());
        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $user
        ]);
    }

    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Data Tidak Ditemukan!',
                'data' => null
            ], 404);
        }

        $email = User::where('email', $request->email)->where('id', '!=', $id)->first();
        if ($email) {
            return response()->json([
                'message' => 'Email Sudah Terdaftar!',
                'data' => null
            ], 422);
        }

        if ($request->hasFile("image")) {
            if ($user->image) {
                Storage::disk("public")->delete($user->image);
            }

            $image = Storage::disk("public")->putFile("user", $request->image);
            $user->image = $image ?? $user->image;
        }

        $user->name = $request->name ?? $user->name;
        $user->email = $request->email ?? $user->email;
        $user->password = Hash::make($request->password) ?? $user->password;
        $user->save();

        return response()->json([
            'message' => "Data Berhasil Diubah!",
            "data" => $user
        ]);        
    }

    public function show(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Data Tidak Ditemukan!',
                'data' => null
            ], 404);
        }

        return response()->json([
            'message' => "Data Berhasil Diambil!",
            "data" => $user
        ]);        
    }

    public function logout(Request $request) 
    {
        $user = PersonalAccessToken::findToken($request->bearerToken());
        $user->delete();
        return response()->json([
            'message' => "Keluar Berhasil!",
            "data" => $user
        ]); 
    }

    public function destroy(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'Data Tidak Ditemukan!',
                'data' => null
            ], 404);
        }

        $user->delete();
        return response()->json([
            'message' => "Data Berhasil Dihapus!",
            "data" => $user
        ]); 
    }
}
