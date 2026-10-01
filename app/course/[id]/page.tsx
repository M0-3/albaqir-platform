import CourseView from "@/components/CourseView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseView id={id} />;
}
