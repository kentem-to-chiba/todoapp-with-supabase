import React, { useState, useEffect } from "react";
import { type Session, createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Box, Button, IconButton, ListItemText, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const supabase = createClient(import.meta.env.VITE_SUPABASE_PROJECT_URL, import.meta.env.VITE_SUPABASE_API_KEY);

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  }

  function generate(element: React.ReactElement) {
    return [0, 1, 2].map((value) =>
      React.cloneElement(element, {
        key: value,
      })
    );
  }

  return (
    <Stack gap={4} maxWidth={360}>
      <Button
        onClick={() => {
          supabase.auth.signOut();
        }}
      >
        ログアウト
      </Button>
      <p>メインコンテンツ</p>
      <List>
        {generate(
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary="dummy item" />
          </ListItem>
        )}
      </List>
    </Stack>
  );
}

export default App;
