import React from "react";
import { Box, AppBar, Toolbar, Typography, Button, Card, CardContent, CardActions, Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleCreateClient = () => {
    // Navigate to a client creation form or open a modal
    navigate("/create-client");
  };

  const handleViewClients = () => {
    // Navigate to a list of clients
    navigate("/view-clients");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate("/logout")}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, Admin!
        </Typography>

        <Grid2 container spacing={3}>
          <Grid2 item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Create Client
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add new clients to the system.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={handleCreateClient}>Create</Button>
              </CardActions>
            </Card>
          </Grid2>

          <Grid2 item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  View Clients
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage and view all clients.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={handleViewClients}>View</Button>
              </CardActions>
            </Card>
          </Grid2>

          <Grid2 item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate and view system reports.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/reports")}>View Reports</Button>
              </CardActions>
            </Card>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
