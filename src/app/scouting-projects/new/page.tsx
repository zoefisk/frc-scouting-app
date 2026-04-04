import PageShell from "@/components/layout/PageShell";
import { Button, Typography } from "@mui/material";
import React from "react";
import CreateExampleProjectButton from "@/components/scouting-project/CreateExampleProjectButton";

export default function NewScoutingProjectPage() {
  return (
    <PageShell>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Create a New Scouting Project
      </Typography>
      <Typography color="text.secondary">
        Here, you will see settings to create a new scouting project, such as
        selecting which teams to include and which data to track.
      </Typography>

      <Button></Button>

      <CreateExampleProjectButton />
    </PageShell>
  );
}

/*


   Create a New Scouting Project

   - Creating user must be signed in
   - Select event & year
   - Select the teams that are participating in this project
   - Would you like all scouters to be required to be signed in with a PEACCEful Scouting App account to contribute data to this project, or would you like to allow anonymous scouters to contribute data without signing in?
       - If you choose to allow anonymous scouters, you will be able to share an invite link with your team members and they can start scouting right away without needing to create an account or sign in.
       - If you choose to require scouters to sign in, you will be able to manage your team members and their access levels (e.g. admin, editor, viewer) from the project dashboard after creating the project.
   - Would you like to include match data, pit scouting data, or both?
       - If match data, would you prefer to track each robot separately for each match (requiring six scouters per match),
         or would you like to track each alliance for the match (requiring only two scouters per match)?
   - Would you like to use default data collection forms, or would you like to customize the data you track for each match or pit scouting session?
       - If you choose to customize, you will be taken to a form builder where you can select from a variety of question types (e.g. multiple choice, short answer, etc.) and create your own custom forms for match scouting and pit scouting.
       - If you choose to use the default forms, you will be able to edit the default forms later if you change your mind (only if no data has been collected yet, otherwise the default forms will be locked to prevent data inconsistencies).

   - Once you have created your scouting project, you will be taken to the project dashboard where you can view your scouting data, edit your forms, and manage your project settings.
        - Get access to an invite link to share with your team members so they can join the project and start scouting with you.
        - Get access to an invite code that your team members can enter in the app to join the project and start scouting with you.
 */
