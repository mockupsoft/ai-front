export default function TasksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="space-y-6">{children}</div>;
}
