export default function ScoutingProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  return (
    <div>
      <h1>Scouting Project: {projectId}</h1>
      {/*<QrScannerPage />*/}
    </div>
  );
}
