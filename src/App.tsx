import { useState, useEffect } from "react";
import { type Session, createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import {
  Button,
  CircularProgress,
  IconButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import type { Database, Tables } from "../types/supabase";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_PROJECT_URL,
  import.meta.env.VITE_SUPABASE_API_KEY
);

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");

  const readTodo = async (): Promise<Pick<Tables<"todo">, "id" | "title">[]> => {
    const { data, error } = await supabase.from("todo").select("id,title");
    if (error) throw new Error(error.message);
    return data;
  };

  const {
    data: todoCache,
    status: todoCacheStatus,
    refetch: todoCacheRefetch,
  } = useQuery({
    queryKey: ["todo", session?.user.id],
    queryFn: readTodo,
  });

  const createTodo = async () => {
    const { error } = await supabase.from("todo").insert([{ title: input }]);
    if (error) throw new Error(error.message);
    setInput("");
    todoCacheRefetch();
  };
  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from("todo").delete().eq("id", id);
    if (error) throw new Error(error.message);
    todoCacheRefetch();
  };

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

  return (
    <Stack gap={4} maxWidth={360}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography noWrap>{session.user.email}</Typography>
        <Button
          onClick={() => {
            supabase.auth.signOut();
          }}
        >
          ログアウト
        </Button>
      </Stack>
      <Stack spacing={4}>
        <Stack direction="row" spacing={2}>
          <TextField
            id="outlined-basic"
            label="新規TODOタイトル"
            variant="outlined"
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <Button variant="outlined" endIcon={<SendIcon />} onClick={createTodo}>
            追加
          </Button>
        </Stack>
        {todoCacheStatus === "error" ? (
          <Typography color="red">エラー</Typography>
        ) : todoCacheStatus === "pending" ? (
          <Stack justifyContent="center">
            <CircularProgress />
          </Stack>
        ) : (
          <List sx={{ overflow: "auto", maxHeight: "300px" }}>
            {todoCache.map((x) => (
              <ListItem
                key={x.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => {
                      deleteTodo(x.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText>
                  <Tooltip title={x.title}>
                    <Typography noWrap>{x.title}</Typography>
                  </Tooltip>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </Stack>
  );
}

export default App;
