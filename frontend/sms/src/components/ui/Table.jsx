import DataTable from "../components/ui/Table";

const columns = [
  { field: "id", headerName: "#", width: 60 },
  { field: "name", headerName: "Name" },
  { field: "status", headerName: "Status",
    renderCell: ({ row }) => <StatusBadge status={row.status} /> },
  { field: "actions", headerName: "Actions", align: "center",
    renderCell: ({ row }) => <ActionButtons row={row} /> },
];

<DataTable columns={columns} rows={students} loading={loading} emptyMessage="No students found" />