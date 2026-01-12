import DataTables from "datatables.net";
import buttons from "datatables.net-buttons"
import $ from "jquery"

export const initDatatable = () => {
    let table = new DataTables("#example-datatables", {
        paging: true,
        searching: true,
        lengthChange: true,
        ordering: true,
        info: true,
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            // {
            //     extend: 'copy',
            //     title: 'Product List'
            // },
            {
                extend: 'excel',
                title: 'Product List'
            },
            // {
            //     extend: 'csv',
            //     title: 'Product List'
            // },
            {
                extend: 'pdf',
                title: 'Product List'
            },
            {
                extend: 'print',
                title: 'Product List'
            },
        ],
        destroy: true,
    });
    return function () {
        table.destroy()
    }
}
