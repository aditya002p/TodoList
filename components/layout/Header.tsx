"use client";
import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

const pages = [{ title: "Todos", href: "/todos" }];

function Header() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();

  React.useEffect(() => {
    // Redirect to todos page after sign-in if not already on a specific page
    if (isSignedIn && pathname === "/") {
      router.push("/todos");
    }
  }, [isSignedIn, pathname, router]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    handleCloseNavMenu();
  };

  return (
    <AppBar position="static" color="inherit">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.href}
                  onClick={() => handleNavigation(page.href)}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.href}
                onClick={() => handleNavigation(page.href)}
                sx={{
                  my: 2,
                  color:
                    pathname === page.href ? "primary.main" : "text.primary",
                  borderBottom: pathname === page.href ? 2 : 0,
                  borderColor: "primary.main",
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* User Button */}
          <Box sx={{ flexGrow: 0 }}>
            <UserButton
              afterSignOutUrl="/sign-in"
              showName
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: 40,
                    height: 40,
                  },
                },
              }}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
