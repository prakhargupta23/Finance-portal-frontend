import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
  Container,
  Tabs,
  Tab,
  AppBar,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import "../css/Finance.css";

interface Message {
  id: number;
  text: string;
  timestamp: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: "100%" }}
    >
      {value === index && <Box sx={{ py: 2, height: "100%" }}>{children}</Box>}
    </div>
  );
}

export default function Finance() {
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [leftTabValue, setLeftTabValue] = useState<number>(0);
  const [rightTabValue, setRightTabValue] = useState<number>(0);

  // Persistence code
  useEffect(() => {
    const saved = localStorage.getItem("financeMessages");
    if (saved) {
      const parsedMessages = JSON.parse(saved);
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
      
      if (parsedMessages.length > 0) {
        const maxId = Math.max(...parsedMessages.map((msg: any) => msg.id));
        setNextId(maxId + 1);
      }
    }
  }, []);
  
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("financeMessages", JSON.stringify(messages));
    } else {
      localStorage.removeItem("financeMessages");
    }
  }, [messages]);

  const handleSubmit = () => {
    if (inputText.trim() === "") return;
    
    const newMessage: Message = {
      id: nextId,
      text: inputText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [newMessage, ...prev]);
    setInputText("");
    setNextId(prev => prev + 1);
  };

  const handleDelete = (id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box className="finance-page">
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Box className="finance-header">
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}>
            Finance Portal Dashboard
          </Typography>
          <p className="subtitle">Multi-tab interface for messaging, AI history, and document management</p>
        </Box>

        <Grid container spacing={3}>
          {/* LEFT HALF - Two Tabs */}
          <Grid item xs={12} md={6}>
            <Paper className="finance-panel" elevation={0} sx={{ height: "72vh", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
              <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: "#fafafa", borderBottom: "1px solid", borderColor: "divider" }}>
                <Tabs
                  className="finance-tabs"
                  value={leftTabValue}
                  onChange={(e, newValue) => setLeftTabValue(newValue)}
                  aria-label="left section tabs"
                  sx={{ "& .MuiTab-root": { minHeight: 52 }, "& .MuiTab-iconWrapper": { mr: 1 } }}
                >
                <Tab 
                  icon={<ChatBubbleIcon />} 
                  iconPosition="start" 
                  label="Message Board" 
                  id="left-tab-0"
                  aria-controls="left-tabpanel-0"
                />
                <Tab 
                  icon={<HistoryIcon />} 
                  iconPosition="start" 
                  label="AI History" 
                  id="left-tab-1"
                  aria-controls="left-tabpanel-1"
                />
              </Tabs>
            </AppBar>

            {/* Message Board Tab (Left Tab 0) */}
            <TabPanel value={leftTabValue} index={0}>
              <Box sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                overflow: "hidden"
              }}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 2,
                  flexShrink: 0,
                  px: 2
                }}>
                  <FormatQuoteIcon sx={{ mr: 1, color: "#0d9488" }} />
                  <Typography variant="h6" component="h2" noWrap>
                    Message History
                  </Typography>
                  <Chip
                    className="finance-chip-messages"
                    label={`${messages.length} messages`}
                    size="small"
                    sx={{ ml: "auto", flexShrink: 0 }}
                  />
                </Box>
                
                <Divider sx={{ flexShrink: 0 }} />
                
                <Box sx={{ 
                  flex: 1,
                  overflow: "auto",
                  p: 2,
                  mt: 1
                }}>
                  {messages.length === 0 ? (
                    <Box
                      className="finance-empty-state"
                      sx={{
                        textAlign: "center",
                        py: 6,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        px: 2,
                      }}
                    >
                      <Box className="icon-wrap">
                        <FormatQuoteIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: "#475569", mb: 0.5 }}>
                        No messages yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Start typing on the right to add your first message.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ pb: 1 }}>
                      {messages.map((message) => (
                        <Card
                          key={message.id}
                          className="finance-message-card"
                          variant="outlined"
                          sx={{
                            mb: 2,
                            width: "100%",
                            overflow: "visible",
                            position: "relative",
                            pl: 1.5,
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box sx={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              mb: 1,
                              flexWrap: "wrap",
                              gap: 1
                            }}>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                Message #{message.id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {formatTime(message.timestamp)}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                maxHeight: "200px",
                                overflow: "auto",
                                mb: 1,
                                pr: 1
                              }}
                            >
                              {message.text}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(message.id)}
                                aria-label="delete message"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </TabPanel>

            {/* AI History Tab (Left Tab 1) */}
            <TabPanel value={leftTabValue} index={1}>
              <Box sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                overflow: "hidden"
              }}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 3,
                  flexShrink: 0,
                  px: 2
                }}>
                  <HistoryIcon sx={{ mr: 1, color: "#0d9488" }} />
                  <Typography variant="h6" component="h2" noWrap>
                    AI Conversation History
                  </Typography>
                  <Chip className="finance-chip-coming" label="Coming Soon" size="small" sx={{ ml: "auto", flexShrink: 0 }} />
                </Box>
                
                <Divider sx={{ flexShrink: 0 }} />
                
                <Box
                  className="finance-empty-state"
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    py: 2,
                  }}
                >
                  <Box className="icon-wrap">
                    <HistoryIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom align="center" sx={{ color: "#475569", fontWeight: 600 }}>
                    AI History Section
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ maxWidth: "85%", mb: 2, color: "#64748b" }}>
                    This tab will display your previous AI conversations, queries, and analysis.
                  </Typography>
                  <Typography variant="caption" align="center" sx={{ color: "#94a3b8" }}>
                    Configure AI integration to start seeing your history here.
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>

        {/* RIGHT HALF - Two Tabs */}
        <Grid item xs={12} md={6}>
          <Paper className="finance-panel" elevation={0} sx={{ height: "72vh", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
            <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: "#fafafa", borderBottom: "1px solid", borderColor: "divider" }}>
              <Tabs
                className="finance-tabs"
                value={rightTabValue}
                onChange={(e, newValue) => setRightTabValue(newValue)}
                aria-label="right section tabs"
                sx={{ "& .MuiTab-root": { minHeight: 52 }, "& .MuiTab-iconWrapper": { mr: 1 } }}
              >
                <Tab 
                  icon={<SendIcon />} 
                  iconPosition="start" 
                  label="Message Editor" 
                  id="right-tab-0"
                  aria-controls="right-tabpanel-0"
                />
                <Tab 
                  icon={<DescriptionIcon />} 
                  iconPosition="start" 
                  label="Document View" 
                  id="right-tab-1"
                  aria-controls="right-tabpanel-1"
                />
              </Tabs>
            </AppBar>

            {/* Message Editor Tab (Right Tab 0) */}
            <TabPanel value={rightTabValue} index={0}>
              <Box sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                overflow: "hidden",
                p: 2
              }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column",
                  height: "100%"
                }}>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      display: "flex", 
                      alignItems: "center",
                      mb: 2
                    }}
                  >
                    <SendIcon sx={{ mr: 1, color: "#0d9488" }} />
                    Compose New Message
                  </Typography>
                  
                  <Box sx={{ 
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0
                  }}>
                    <TextField
                      fullWidth
                      multiline
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message here… Use Shift+Enter for new lines, or Enter to submit."
                      variant="outlined"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          height: "100%",
                          alignItems: "flex-start",
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                          "&:hover": { bgcolor: "#f1f5f9" },
                          "&.Mui-focused": { bgcolor: "#fff" },
                        },
                      }}
                      inputProps={{ maxLength: 1000 }}
                      InputProps={{
                        sx: {
                          height: "100%",
                          "& textarea": { resize: "none" },
                        },
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider"
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Character count: {inputText.length}/1000
                    </Typography>
                    
                    <Button
                      className="finance-submit-btn"
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={handleSubmit}
                      disabled={inputText.trim() === ""}
                      sx={{ px: 4 }}
                    >
                      Submit Message
                    </Button>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {/* Document View Tab (Right Tab 1) */}
            <TabPanel value={rightTabValue} index={1}>
              <Box sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                overflow: "hidden"
              }}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 3,
                  flexShrink: 0,
                  px: 2
                }}>
                  <DescriptionIcon sx={{ mr: 1, color: "#0d9488" }} />
                  <Typography variant="h6" component="h2" noWrap>
                    Document Viewer
                  </Typography>
                  <Chip className="finance-chip-coming" label="Empty" size="small" sx={{ ml: "auto", flexShrink: 0 }} />
                </Box>

                <Divider sx={{ flexShrink: 0 }} />

                <Box
                  className="finance-empty-state"
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    py: 2,
                  }}
                >
                  <Box className="icon-wrap">
                    <DescriptionIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom align="center" sx={{ color: "#475569", fontWeight: 600 }}>
                    Document View Section
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ maxWidth: "85%", mb: 2, color: "#64748b" }}>
                    This tab will display uploaded documents, PDFs, or other financial reports for analysis.
                  </Typography>
                  <Typography variant="caption" align="center" sx={{ color: "#94a3b8" }}>
                    Upload documents to view them here.
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

        {/* Footer Stats */}
        <Box className="finance-footer">
          <Typography variant="caption" component="span">
            Total messages: {messages.length} · Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}