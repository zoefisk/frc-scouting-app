"use client";

import React from "react";
import { Stack, Typography } from "@mui/material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ProjectsEmptyState from "@/components/scouting-projects/pages/index/ProjectsEmptyState";
import ProjectsGrid from "@/components/scouting-projects/pages/index/ProjectsGrid";
import ProjectsHeader from "@/components/scouting-projects/pages/index/ProjectsHeader";
import { useScoutingProjects } from "@/components/scouting-projects/pages/index/useScoutingProjects";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import { updateScoutingProjectClient } from "@/lib/firebase/client/projects";
import type { ProjectListItem } from "@/components/scouting-projects/pages/index/types";

export default function ScoutingProjectsIndexPage() {
  const {
    projects,
    error,
    isLoading,
    togglePinned,
    archiveLocally,
    restoreLocally,
    reloadProjects,
  } = useScoutingProjects();
  const { effectiveOnline } = useSyncMode();
  const toast = useToast();
  const [archiveDialogProject, setArchiveDialogProject] =
    React.useState<ProjectListItem | null>(null);
  const [isSubmittingArchive, setIsSubmittingArchive] = React.useState(false);

  const activeProjects = React.useMemo(
    () =>
      projects.filter(
        (project) => !project.isGloballyArchived && !project.isLocallyArchived
      ),
    [projects]
  );
  const archivedProjects = React.useMemo(
    () =>
      projects.filter(
        (project) => project.isGloballyArchived || project.isLocallyArchived
      ),
    [projects]
  );

  const handleArchive = React.useCallback(
    async (project: ProjectListItem) => {
      if (project.memberRole === "owner") {
        setArchiveDialogProject(project);
        return;
      }

      await archiveLocally(project.id);
      toast.success("Project archived for this device.");
    },
    [archiveLocally, toast]
  );

  const handleRestore = React.useCallback(
    async (project: ProjectListItem) => {
      if (project.isGloballyArchived && project.memberRole === "owner") {
        if (!effectiveOnline) {
          toast.warning("Go online to restore this project for everyone.");
          return;
        }

        try {
          await updateScoutingProjectClient(project.id, {
            status: "active",
          });
          await reloadProjects();
          toast.success("Project restored for everyone.");
        } catch (error) {
          console.error("Failed to restore project:", error);
          toast.error("Could not restore the project.");
        }

        return;
      }

      await restoreLocally(project.id);
      toast.success("Project restored on this device.");
    },
    [effectiveOnline, reloadProjects, restoreLocally, toast]
  );

  const handleConfirmOwnerArchive = React.useCallback(async () => {
    if (!archiveDialogProject) {
      return;
    }

    if (!effectiveOnline) {
      toast.warning("Go online to archive this project for everyone.");
      return;
    }

    try {
      setIsSubmittingArchive(true);
      await updateScoutingProjectClient(archiveDialogProject.id, {
        status: "inactive",
      });
      await reloadProjects();
      toast.success("Project archived for everyone.");
      setArchiveDialogProject(null);
    } catch (error) {
      console.error("Failed to archive project:", error);
      toast.error("Could not archive the project.");
    } finally {
      setIsSubmittingArchive(false);
    }
  }, [archiveDialogProject, effectiveOnline, reloadProjects, toast]);

  return (
    <Stack spacing={3}>
      <ProjectsHeader />

      {isLoading ? (
        <Typography color="text.secondary">
          Loading scouting projects...
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : projects.length === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <Stack spacing={2}>
          {activeProjects.length > 0 ? (
            <ProjectsGrid
              projects={activeProjects}
              onTogglePinned={togglePinned}
              onArchive={(project) => void handleArchive(project)}
              onRestore={(project) => void handleRestore(project)}
            />
          ) : (
            <Alert severity="info">
              No active scouting projects are visible right now.
            </Alert>
          )}

          {archivedProjects.length > 0 ? (
            <Accordion
              disableGutters
              sx={{ borderRadius: "16px !important", overflow: "hidden" }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack spacing={0.25}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Archived Projects ({archivedProjects.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hidden or inactive scouting projects can be restored here.
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <ProjectsGrid
                  projects={archivedProjects}
                  onTogglePinned={togglePinned}
                  onArchive={(project) => void handleArchive(project)}
                  onRestore={(project) => void handleRestore(project)}
                />
              </AccordionDetails>
            </Accordion>
          ) : null}
        </Stack>
      )}

      <Dialog
        open={Boolean(archiveDialogProject)}
        onClose={() =>
          !isSubmittingArchive ? setArchiveDialogProject(null) : undefined
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Archive Project for Everyone?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography>
              Archiving{" "}
              <strong>{archiveDialogProject?.name ?? "this project"}</strong>{" "}
              will set its shared status to inactive for everyone on the team.
            </Typography>
            <Alert severity="warning">
              The project will move into the archived section, appear greyed out
              on its project pages, and will need to be restored later if you
              want it active again.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setArchiveDialogProject(null)}
            disabled={isSubmittingArchive}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => void handleConfirmOwnerArchive()}
            disabled={isSubmittingArchive}
          >
            {isSubmittingArchive ? "Archiving..." : "Archive for Everyone"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
