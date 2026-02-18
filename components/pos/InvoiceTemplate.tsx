import React from 'react';
import { Transaction, CompanyProfile, AdminUser } from '../../types';

interface InvoiceTemplateProps {
  transaction: Transaction | null;
  profile: CompanyProfile | null;
  currentUser: AdminUser | null;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID').format(amount);
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};
const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('id-ID', options).format(date).replace(/\./g, ':') + ' WIB';
};

const getCityFromAddress = (address: string): string => {
    if (!address) return 'Kota';
    const parts = address.split(/, | /);
    // Return the second to last part, which is often the city/regency name in Indonesian addresses.
    return parts[parts.length - 2] || 'Kota';
};

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ transaction, profile, currentUser }, ref) => {
    if (!transaction || !profile) return null;

    const city = getCityFromAddress(profile.address);
    const MIN_ROWS = 10;
    const orderNumber = parseInt(transaction.invoiceNumber.slice(-4), 10) || transaction.invoiceNumber;


    return (
        <div ref={ref} className="bg-white text-black p-4" style={{ width: '1024px', fontFamily: "'Arial', sans-serif" }}>
            {/* Header Section */}
            <header className="flex justify-between items-start text-sm">
                {/* Left: Company Info */}
                <div className="w-1/2">
                    <img src={profile.logo} alt="Company Logo" className="w-64 mb-2" />
                    <p className="font-semibold">{profile.address}</p>
                    <p className="font-semibold">No. Telp. / HP . {profile.phone}</p>
                </div>

                {/* Right: Customer Info */}
                <div className="w-1/2 flex flex-col items-end">
                    <p>{city}, {formatDate(transaction.date)}</p>
                    <div className="mt-2 w-full max-w-sm">
                        <div className="flex border border-black">
                            <span className="bg-gray-200 p-1 w-28 font-bold border-r border-black">Kepada Yth.</span>
                            <div className="p-1 flex-1 border-b border-dotted border-black">{transaction.customerName || <>&nbsp;</>}</div>
                        </div>
                        <div className="flex border-x border-black">
                            <span className="bg-gray-200 p-1 w-28 font-bold border-r border-black">Perusahaan</span>
                            <div className="p-1 flex-1 border-b border-dotted border-black">&nbsp;</div>
                        </div>
                        <div className="flex border-x border-black">
                            <span className="bg-gray-200 p-1 w-28 font-bold border-r border-black">Telp</span>
                            <div className="p-1 flex-1 border-b border-dotted border-black">{transaction.customerPhone || <>&nbsp;</>}</div>
                        </div>
                        <div className="flex border border-black border-t-0">
                            <span className="bg-gray-200 p-1 w-28 font-bold border-r border-black">Alamat</span>
                            <div className="p-1 flex-1 border-b border-dotted border-black">{transaction.customerAddress || <>&nbsp;</>}</div>
                        </div>
                    </div>
                    <p className="mt-1 font-bold">NO. ORDER #{orderNumber}</p>
                </div>
            </header>

            {/* Items Table Section */}
            <main className="mt-4">
                <table className="w-full border-collapse border border-black text-center text-sm">
                    <thead>
                        <tr className="bg-gray-200 font-bold">
                            <th className="border border-black p-1 w-[5%]">QTY</th>
                            <th className="border border-black p-1 w-[15%]">PRODUK</th>
                            <th className="border border-black p-1 w-[15%]">BAHAN</th>
                            <th className="border border-black p-1">DETAIL PESANAN</th>
                            <th className="border border-black p-1 w-[10%]">UKURAN</th>
                            <th className="border border-black p-1 w-[15%]">HARGA</th>
                            <th className="border border-black p-1 w-[15%]">JUMLAH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaction.items.map((item, index) => (
                            <tr key={item.id || index} style={{ height: '30px' }}>
                                <td className="border-l border-r border-dotted border-black">{item.quantity}</td>
                                <td className="border-l border-r border-dotted border-black text-left pl-2">{item.name}</td>
                                <td className="border-l border-r border-dotted border-black text-left pl-2">{item.bahan}</td>
                                <td className="border-l border-r border-dotted border-black text-left pl-2">{item.detail}</td>
                                <td className="border-l border-r border-dotted border-black">{item.ukuran}</td>
                                <td className="border-l border-r border-dotted border-black text-right pr-2">{formatCurrency(item.price)}</td>
                                <td className="border-l border-r border-dotted border-black text-right pr-2">{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                        {transaction.items.length < MIN_ROWS && Array.from({ length: MIN_ROWS - transaction.items.length }).map((_, index) => (
                            <tr key={`empty-${index}`} style={{ height: '30px' }}>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                                <td className="border-l border-r border-dotted border-black">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {/* Footer Section */}
            <footer className="mt-2 text-sm">
                <div className="flex justify-between items-start">
                    {/* Left: Signatures & Payment */}
                    <div className="w-1/2">
                        <div className="flex justify-around items-start mt-4">
                            <div className="text-center">
                                <p>HORMAT KAMI</p>
                                <div className="mt-16">
                                    <p className="font-bold h-6 text-center">{currentUser?.name || ''}</p>
                                    <p className="border-b-2 border-dashed border-black px-12"></p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p>PEMESAN</p>
                                <div className="mt-16">
                                    <p className="h-6">&nbsp;</p>
                                    <p className="border-b-2 border-dashed border-black px-12"></p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs">
                            <p className="font-bold">Cara Bayar :</p>
                            <p>Pembayaran Transfer Via Rekening</p>
                            {profile.bankAccount.split('\n').map((line, index) => (
                                <p key={index} className="font-semibold">{line}</p>
                             ))}
                        </div>
                    </div>

                    {/* Right: Totals & Notes */}
                    <div className="w-2/5 flex flex-col items-end">
                        <div className="w-full max-w-xs border border-black">
                            <div className="flex justify-between p-1 border-b border-black">
                                <span className="font-bold">TOTAL</span>
                                <span className="font-bold">{formatCurrency(transaction.subtotal)}</span>
                            </div>
                            <div className="flex justify-between p-1 border-b border-black">
                                <span className="font-bold">UANG MUKA</span>
                                <span>{formatCurrency(transaction.downPayment)}</span>
                            </div>
                            <div className="flex justify-between p-1">
                                <span className="font-bold">SISA</span>
                                <span>{formatCurrency(transaction.remainingBalance)}</span>
                            </div>
                        </div>
                        <div className="mt-4 text-right text-xs">
                            <p>dicetak pada {formatDateTime(new Date())}</p>
                            <p>Menunda nunda pembayaran hutang oleh orang mampu merupakan suatu kedzaliman I H.T. Abu Daud I</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default InvoiceTemplate;