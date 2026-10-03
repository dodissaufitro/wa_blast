<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $dummyUsers = [
            [
                'name' => 'Admin WABlast',
                'username' => 'admin',
                'email' => 'admin@wablast.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => Carbon::now(),
            ],
            [
                'name' => 'Customer Support WA',
                'username' => 'cs_blast',
                'email' => 'cs@wablast.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => Carbon::now(),
            ],
            [
                'name' => 'Tim Marketing & Broadcast',
                'username' => 'marketing',
                'email' => 'marketing@wablast.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => Carbon::now(),
            ],
            [
                'name' => 'Pengguna Demo WABlast',
                'username' => 'demo',
                'email' => 'demo@wablast.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => Carbon::now(),
            ],
        ];

        foreach ($dummyUsers as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Seed sample contacts if user has none
            if ($user->contacts()->count() === 0) {
                $sampleContacts = [
                    ['name' => 'Bpk. Hendra Gunawan', 'phone' => '6281234567890', 'group' => 'Pelanggan VIP', 'email' => 'hendra@gmail.com', 'notes' => 'Member loyal sejak 2024, pesanan rutin bulanan.', 'status' => 'active'],
                    ['name' => 'Ibu Siti Rahmawati', 'phone' => '6281398765432', 'group' => 'Pelanggan VIP', 'email' => 'siti.rahma@yahoo.com', 'notes' => 'Sering order paket grosir.', 'status' => 'active'],
                    ['name' => 'Randi Saputra (Distributor Jkt)', 'phone' => '6285811223344', 'group' => 'Reseller Resmi', 'email' => 'randi@tokomaju.id', 'notes' => 'Distributor Jabodetabek, plafon lancar.', 'status' => 'active'],
                    ['name' => 'Dewi Anggraini', 'phone' => '6287755667788', 'group' => 'Reseller Resmi', 'email' => 'dewi.ang@gmail.com', 'notes' => 'Reseller wilayah Jawa Barat.', 'status' => 'active'],
                    ['name' => 'Ahmad Fauzi', 'phone' => '6282133445566', 'group' => 'Leads Promo 10.10', 'email' => 'fauzi.ahmad@gmail.com', 'notes' => 'Tanya via WhatsApp katalog promo.', 'status' => 'active'],
                    ['name' => 'Bambang Sudiro', 'phone' => '6289612345678', 'group' => 'Leads Promo 10.10', 'email' => null, 'notes' => 'Nomor didapat dari event expo UMKM.', 'status' => 'active'],
                    ['name' => 'dr. Nadia Kirana', 'phone' => '6281987654321', 'group' => 'Pelanggan VIP', 'email' => 'nadia.kirana@klinik.co.id', 'notes' => 'Langganan produk herbal & suplemen.', 'status' => 'active'],
                    ['name' => 'Toko Barokah Jaya', 'phone' => '6281287654321', 'group' => 'Reseller Resmi', 'email' => 'barokah@jaya.com', 'notes' => 'Order minimal 50 pcs per pengiriman.', 'status' => 'active'],
                ];

                foreach ($sampleContacts as $contact) {
                    $user->contacts()->create($contact);
                }
            }

            // Seed sample templates if user has none
            if ($user->templates()->count() === 0) {
                $sampleTemplates = [
                    [
                        'name' => 'Promo Flash Sale Diskon 35%',
                        'category' => 'Promosi',
                        'content' => "Halo {nama}! 👋\n\nKabar gembira khusus untuk Anda. Hari ini kami memberikan voucher diskon *35%* untuk pemesanan berikutnya!\n\nGunakan kode kupon: *{kode_promo}*\nBerlaku hingga akhir pekan ini melalui link: https://toko.id/promo\n\nJangan sampai terlewat ya! 🚀",
                    ],
                    [
                        'name' => 'Pengingat Tagihan & Invoice',
                        'category' => 'Notifikasi',
                        'content' => "Yth. Bpk/Ibu {nama},\n\nKami menginformasikan bahwa invoice tagihan no. *{invoice}* telah terbit dan jatuh tempo pada tanggal *{tanggal}*.\n\nMohon segera menyelesaikan pembayaran untuk kelancaran layanan Anda. Terima kasih! 🙏",
                    ],
                    [
                        'name' => 'Follow Up Keranjang Belanja',
                        'category' => 'Follow Up',
                        'content' => "Hai Kak {nama}! 😊\n\nKami melihat Anda sempat memilih produk namun belum menyelesaikan proses checkout.\n\nApakah ada pertanyaan terkait produk atau bantuan metode pembayaran? CS kami siap membantu Kakak sekarang ya! 💬",
                    ],
                    [
                        'name' => 'Undangan Webinar Digital Marketing',
                        'category' => 'Promosi',
                        'content' => "Halo {nama}! 🌟\n\nAnda diundang mengikuti sesi Exclusive Masterclass bersama praktisi bisnis secara GRATIS!\n\n🗓️ Waktu: Sabtu, 19:30 WIB\n🔗 Daftar: https://event.id/daftar\n\nKuota terbatas, segera amankan kursi Anda!",
                    ],
                ];

                foreach ($sampleTemplates as $tmpl) {
                    $user->templates()->create($tmpl);
                }
            }
        }
    }
}
