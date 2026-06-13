import { Box } from "@mui/material";
import type { ProjectListItem } from "./types";
import ProjectCard from "./ProjectCard";

export default function ProjectsGrid({
  projects,
  onTogglePinned,
  onArchive,
  onRestore,
}: {
  projects: ProjectListItem[];
  onTogglePinned: (projectId: string, pinned: boolean) => Promise<void>;
  onArchive: (project: ProjectListItem) => void;
  onRestore: (project: ProjectListItem) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "repeat(2, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onTogglePinned={onTogglePinned}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </Box>
  );
}
