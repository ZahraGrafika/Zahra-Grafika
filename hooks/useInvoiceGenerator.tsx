
import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction, CompanyProfile, AdminUser } from '../types';
import { getCompanyProfile } from '../services/dataService';
import InvoiceTemplate from '../components/pos/InvoiceTemplate';

export const useInvoiceGenerator = (currentUser: AdminUser | null) => {
    const [transactionToPrint, setTransactionToPrint] = useState<Transaction | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [printAction, setPrintAction] = useState<'pdf' | 'direct' | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCompanyProfile(getCompanyProfile());
    }, []);

    const generateInvoice = useCallback((transaction: Transaction, action: 'pdf' | 'direct') => {
        if (isGenerating) {
            alert("Harap tunggu, proses sebelumnya masih berjalan...");
            return;
        }
        setTransactionToPrint(transaction);
        setPrintAction(action);
    }, [isGenerating]);

    useEffect(() => {
        if (!transactionToPrint || !invoiceRef.current || !printAction) {
            return;
        }

        setIsGenerating(true);
        const element = invoiceRef.current;
        const invoiceNumberToUse = transactionToPrint.invoiceNumber;

        setTimeout(() => {
            if (printAction === 'pdf') {
                html2canvas(element, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio = canvasWidth / canvasHeight;
                    const pdfHeight = pdfWidth / ratio;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Invoice-${invoiceNumberToUse}.pdf`);
                }).catch(err => {
                    console.error("Error generating PDF:", err);
                    alert("Gagal membuat PDF. Silakan coba lagi.");
                }).finally(() => {
                    setTransactionToPrint(null);
                    setPrintAction(null);
                    setIsGenerating(false);
                });
            } else if (printAction === 'direct') {
                const contentToPrint = element.innerHTML;
                const printWindow = window.open('', '_blank');

                if (printWindow) {
                    printWindow.document.open();
                    printWindow.document.write('<html><head><title>Cetak Invoice</title>');
                    printWindow.document.write('<style>@media print { @page { size: A5 landscape; margin: 0; } body { margin: 0; } }</style>');

                    Array.from(document.styleSheets).forEach(styleSheet => {
                        try {
                            if (styleSheet.href) {
                                printWindow.document.write(`<link rel="stylesheet" href="${styleSheet.href}">`);
                            } else if (styleSheet.cssRules) {
                                printWindow.document.write(`<style>${Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('')}</style>`);
                            }
                        } catch (e) {
                            console.warn('Could not read stylesheet for printing:', e);
                        }
                    });

                    printWindow.document.write('</head><body onload="window.print(); window.close();">');
                    printWindow.document.write(contentToPrint);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                } else {
                    alert('Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.');
                }
                setTransactionToPrint(null);
                setPrintAction(null);
                setIsGenerating(false);
            }
        }, 100);
    }, [transactionToPrint, printAction]);

    const InvoiceTemplateComponent = (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -10 }}>
            <InvoiceTemplate ref={invoiceRef} transaction={transactionToPrint} profile={companyProfile} currentUser={currentUser} />
        </div>
    );

    return { isGenerating, generateInvoice, InvoiceTemplateComponent, transactionToPrint, printAction };
};
