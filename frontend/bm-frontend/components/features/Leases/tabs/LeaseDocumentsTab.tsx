export default function LeaseDocumentsTab({ files, setFiles }: any) {
  const onChange = (e: any) => {
    const valid = Array.from(e.target.files).filter((f: any) =>
      ["application/pdf", "image/png", "image/jpeg"].includes(f.type)
    );
    setFiles(valid);
  };

  return (
    <>
      <input
        type="file"
        multiple
        className="form-control mb-3"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={onChange}
      />

      <ul className="list-group">
        {files.map((f: File, i: number) => (
          <li key={i} className="list-group-item">
            {f.name}
          </li>
        ))}
        {files.length === 0 && (
          <li className="list-group-item text-muted">
            No documents selected
          </li>
        )}
      </ul>
    </>
  );
}
