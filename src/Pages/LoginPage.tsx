

import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Grid,
  Box,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { userService } from "../services/user.service";
import { useNavigate } from "react-router-dom";
import bg3 from '../assets/bg3.png';
import loginleft from '../assets/loginleft.png';
import train from '../assets/Train.png';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: `url(${bg3}) center center no-repeat`,
        backgroundSize: `${100}% ${100}%`,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <Box sx={{ mr: '0%',position: 'absolute', left: 450, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', zIndex: 2, pointerEvents: 'none' }}>
        <img src={train} alt="train" style={{ width: 700, opacity: 0.1, color: '#fff', filter: 'brightness(1) invert(1)', transform: 'scaleX(-1)' }} />
      </Box>
      <Grid container sx={{ minHeight: "100vh" }}>
        {/* Left half with image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "block" },
            background: `url(${loginleft}) center center no-repeat`,
            backgroundSize: `${100}% ${100}%`,
            minHeight: "100vh",
          }}
        />
        {/* Right half with login card */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >

          <Paper
            elevation={6}
            sx={{
              p: 4,
              width: 350,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Typography
              variant="h3"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#fff" }}
            >
              Hello, Welcome
            </Typography>
            <Formik
              initialValues={{ username: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setLoading(true);
                try {
                  let response = await userService.login(
                    values.username,
                    values.password
                  );
                  if (response.success) {
                    const { role } = response.data;
                    localStorage.setItem("role", role);
                    setSnackbarOpen(true);
                    setSnackbarMessage("Login successfully");
                    navigate("/Expenditure");
                  } else {
                    setSnackbarOpen(true);
                    setSnackbarMessage(`Login unsuccessfull ${response.message}`);
                  }
                  resetForm();
                } catch (error: any) {
                  setSnackbarOpen(false);
                  setSnackbarMessage(error.message);
                }
                setLoading(false);
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Box mb={4} border={'#fff'}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Username"
                      variant="outlined"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#fff',
                            borderWidth: 2,
                          },
                          '&:hover fieldset': {
                            borderColor: '#fff',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#fff',
                          },
                        },
                        input: { color: '#000' },
                        label: { color: '#000', fontWeight: 700, },
                      }}
                    />
                  </Box>
                  <Box mb={5}>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type="password"
                      variant="outlined"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#fff',
                            borderWidth: 2,
                          },
                          '&:hover fieldset': {
                            borderColor: '#fff',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#fff',
                          },
                        },
                        input: { color: '#000' },
                        label: { color: '#000', fontWeight: 700, },
                      }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      height: '3rem',
                      fontSize: '1rem',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      fontWeight: 700,
                      width: 180,
                      mx: 'auto',
                      display: 'block',
                      transition: 'background 0.2s',
                      '&:hover': {
                        backgroundColor: '#4791db',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </Paper>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "#1976d2",
                color: "white",
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginPage;
