import { columns } from "~/app/_components/Columns";
import { DataTable } from "~/app/_components/DataTable";
import { getVideos } from "~/lib/videos";

export const revalidate = 3600;

export default async function Home() {
  const data = await getVideos();

  return <DataTable columns={columns} data={data} />;
}
