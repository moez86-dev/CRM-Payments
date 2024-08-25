$(document).ready(function() {
    function loadContracts() {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        $('#contracts-list').empty();

        if (contracts.length > 0) {
            let table = `
                <table class="table table-bordered" id="contracts-table">
                    <thead class="table-dark">
                        <tr>
                            <th>اسم العميل</th>
                            <th>إجمالي مبلغ العقد</th>
                            <th>الدفعة المقدمة</th>
                            <th>الدفعات الجديدة</th>
                            <th>المبلغ المتبقي</th>
                            <th>تاريخ العقد</th>
                            <th>تاريخ نهاية العقد</th>
                            <th>ملاحظات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            contracts.forEach((contract, index) => {
                let totalPayments = contract.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toFixed(2);
                let remainingAmount = (parseFloat(contract.totalAmount) - parseFloat(contract.advancePayment) - totalPayments).toFixed(2);

                table += `
                    <tr>
                        <td>${contract.clientName}</td>
                        <td>${parseFloat(contract.totalAmount).toFixed(2)}</td>
                        <td>${parseFloat(contract.advancePayment).toFixed(2)}</td>
                        <td>${totalPayments}</td>
                        <td>${remainingAmount}</td>
                        <td>${contract.contractDate}</td>
                        <td>${contract.endDate}</td>
                        <td>${contract.notes}</td>
                        <td>
                            <button class="btn btn-sm btn-info view-payments" data-index="${index}">متابعة الدفعات</button>
                            <button class="btn btn-sm btn-success add-payment" data-index="${index}">إضافة دفعة</button>
                            <button class="btn btn-sm btn-danger delete-payment" data-index="${index}">حذف دفعات</button>
                            <button class="btn btn-sm btn-danger delete-contract" data-index="${index}">حذف العقد</button>
                        </td>
                    </tr>
                `;
            });

            table += `
                    </tbody>
                </table>
            `;

            $('#contracts-list').append(table);
        } else {
            $('#contracts-list').append('<p class="text-center">لا توجد عقود مسجلة.</p>');
        }
    }

    function exportToExcel() {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        let exportData = contracts.map(contract => ({
            'ملاحظات': contract.notes,
            'تاريخ نهاية العقد': contract.endDate,
            'تاريخ العقد': contract.contractDate,
            'المبلغ المتبقي': parseFloat(contract.totalAmount) - parseFloat(contract.advancePayment) - contract.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toFixed(2),
            'الدفعات الجديدة': contract.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toFixed(2),
            'الدفعة المقدمة': parseFloat(contract.advancePayment).toFixed(2),
            'إجمالي مبلغ العقد': parseFloat(contract.totalAmount).toFixed(2),
            'اسم العميل': contract.clientName
        }));

        // إنشاء ورقة عمل جديدة
        let ws = XLSX.utils.json_to_sheet(exportData);

        // إعداد الكتاب
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contracts");

        // كتابة الملف
        XLSX.writeFile(wb, 'contracts.xlsx');
    }

    function saveContract(contract) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        contracts.push(contract);
        localStorage.setItem('contracts', JSON.stringify(contracts));
        loadContracts();
    }

    function deleteContract(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        contracts.splice(index, 1);
        localStorage.setItem('contracts', JSON.stringify(contracts));
        loadContracts();
        alert('تم حذف العقد بنجاح!');
    }

    function deleteAllContracts() {
        if (confirm('هل أنت متأكد من حذف جميع العقود؟')) {
            localStorage.removeItem('contracts');
            loadContracts();
            alert('تم حذف جميع العقود بنجاح!');
        }
    }

    function addPayment(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        let paymentAmount = prompt('أدخل مبلغ الدفعة:');
        let paymentDate = prompt('أدخل تاريخ الدفعة:');

        if (paymentAmount && paymentDate) {
            let payment = {
                amount: paymentAmount,
                date: paymentDate
            };

            if (!contracts[index].payments) {
                contracts[index].payments = [];
            }
            contracts[index].payments.push(payment);
            localStorage.setItem('contracts', JSON.stringify(contracts));
            loadContracts();
            alert('تمت إضافة الدفعة بنجاح!');
        } else {
            alert('يرجى إدخال جميع بيانات الدفعة.');
        }
    }

    function deletePayments(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        if (confirm('هل أنت متأكد من حذف جميع الدفعات لهذا العقد؟')) {
            contracts[index].payments = [];
            localStorage.setItem('contracts', JSON.stringify(contracts));
            loadContracts();
            alert('تم حذف جميع الدفعات لهذا العقد بنجاح!');
        }
    }

    function viewPayments(index) {
        let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        let contract = contracts[index];

        let paymentList = 'الدفعات: \n';

        if (contract.payments && contract.payments.length > 0) {
            contract.payments.forEach((payment, i) => {
                paymentList += `دفعة ${i + 1}: \n`;
                paymentList += `- المبلغ: ${payment.amount}\n`;
                paymentList += `- التاريخ: ${payment.date}\n`;
            });
        } else {
            paymentList += 'لا توجد دفعات مسجلة.';
        }

        alert(paymentList);
    }

    $('#add-contract-btn').click(function() {
        let clientName = prompt('أدخل اسم العميل:');
        let contractDate = prompt('أدخل تاريخ العقد:');
        let endDate = prompt('أدخل تاريخ نهاية العقد:');
        let totalAmount = prompt('أدخل المبلغ الإجمالي للعقد:');
        let advancePayment = prompt('أدخل مبلغ الدفعة المقدمة:');
        let notes = prompt('أدخل ملاحظات إضافية (اختياري):');

        if (clientName && contractDate && endDate && totalAmount && advancePayment) {
            let newContract = {
                clientName: clientName,
                contractDate: contractDate,
                endDate: endDate,
                totalAmount: totalAmount,
                advancePayment: advancePayment,
                notes: notes || '',
                payments: [] // إضافة مصفوفة الدفعات
            };
            saveContract(newContract);
        } else {
            alert('يرجى ملء جميع الحقول الإلزامية.');
        }
    });

    $('#contracts-list').on('click', '.view-payments', function() {
        let index = $(this).data('index');
        viewPayments(index);
    });

    $('#contracts-list').on('click', '.add-payment', function() {
        let index = $(this).data('index');
        addPayment(index);
    });

    $('#contracts-list').on('click', '.delete-contract', function() {
        let index = $(this).data('index');
        if (confirm('هل أنت متأكد من حذف هذا العقد؟')) {
            deleteContract(index);
        }
    });

    $('#contracts-list').on('click', '.delete-payment', function() {
        let index = $(this).data('index');
        deletePayments(index);
    });

    $('#delete-all-contracts-btn').click(function() {
        deleteAllContracts();
    });

    $('#export-to-excel').click(function() {
        exportToExcel();
    });

    // تحميل العقود عند التحميل
    loadContracts();
});
