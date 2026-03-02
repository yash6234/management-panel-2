# UI Documentation

Overview of the Management Panel UI – pages, layout, and form fields.

---

## Layout Structure

### Sidebar (Navigation)
| Route | Label | Icon |
|-------|-------|------|
| `/dashboard` | Dashboard | LayoutDashboard |
| `/dashboard/masters` | Masters | Users |
| `/dashboard/sales` | Sales | ShoppingCart |
| `/dashboard/data` | Data | Database |
| — | Logout | LogOut |

### Dashboard Header
| Element | Type | Description |
|---------|------|-------------|
| Search | Text input | Global search, placeholder: "Search..." |

---

## Pages & Fields

### 1. Login (`/login`)

**Layout:** Centered card on gradient background

| Field | Type | Label | Required | Placeholder |
|-------|------|-------|----------|-------------|
| email | email | Email | Yes | Enter your email |
| password | password | Password | Yes | Enter your password |

**Actions:** Sign in

---

### 2. Dashboard (`/dashboard`)

**Layout:** Grid of stat cards + Recent Activity table

**Stat Cards (4):**
| ID | Label |
|----|-------|
| persons | Persons |
| diesel | Vehicle Entries |
| commission | Commission/Labour |
| sales | Sales Entries |

**Recent Activity Table:**
| Column | Description |
|--------|-------------|
| Name | Person name |
| Date | Formatted date (MMM d, yyyy) |
| Products | Sales of products |
| Deposit | Deposit amount (badge) |

---

### 3. Masters (`/dashboard/masters`)

**Layout:** Card with tabs (Personal Details, Vehicle, Commission/Labour)

#### Tab: Personal Details

**Table:**
| Column | Description |
|--------|-------------|
| Name | Person name |
| M.no | Mobile number |
| Email | Email address |
| Address | Truncated address |
| Actions | View, Edit, Delete |

**Person Modal (Add/Edit):**
| Field | Type | Label | Required | Placeholder |
|-------|------|-------|----------|-------------|
| name | text | Name | Yes | Full name |
| mobile | tel | M.no | No | Mobile number |
| email | email | Email | No | Email address |
| address | textarea | Address | No | Address |

**Person View Modal:** Name, M.no, Email, Address (read-only)

---

#### Tab: Vehicle

**Table:**
| Column | Description |
|--------|-------------|
| Name | Vehicle/person name |
| Amount | Numeric amount |
| Actions | Edit, Delete |

**Vehicle Modal (Add/Edit):**
| Field | Type | Label | Required | Placeholder |
|-------|------|-------|----------|-------------|
| name | text | Name | Yes | Name |
| amount | number | Amount | Yes | Amount (min 0, step 0.01) |

---

#### Tab: Commission/Labour

**Table:**
| Column | Description |
|--------|-------------|
| Name | Entry name |
| Amount | Numeric amount |
| Actions | Edit, Delete |

**Commission/Labour Modal (Add/Edit):**
| Field | Type | Label | Required | Placeholder |
|-------|------|-------|----------|-------------|
| name | text | Name | Yes | Name |
| amount | number | Amount | Yes | Amount (min 0, step 0.01) |

---

### 4. Sales (`/dashboard/sales`)

**Layout:** Header (person filter) + full-screen calendar

**Header:**
| Element | Type | Description |
|---------|------|-------------|
| Person | Select | Filter by person: "All persons" or person name |

**Calendar:** FullCalendar (month/week/day), click date to add sales entry

**Sales Entry Modal (Add):**
| Field | Type | Label | Required | Placeholder |
|-------|------|-------|----------|-------------|
| Person | Select | Person | No | Select person (optional) |
| date | date | Date | Yes | — |
| salesOfProducts | text | Sales of Products | Yes | Sales of products |
| deposit | text | Deposit | Yes | Deposit |
| credit | text | Credit | No | Credit |
| location | text | Location | No | Location |

---

### 5. Data (`/dashboard/data`)

**Layout:** Card with tabs – grid of DetailCards (200px height)

#### Tab: Personal Details
**Card fields:** Name (title), M.no, Email, Address

#### Tab: Vehicle
**Card fields:** Name (title), Amount

#### Tab: Commission/Labour
**Card fields:** Name (title), Amount

#### Tab: Sales
**Card fields:** Name (title), Date, Products, Deposit, Credit, Location

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #0F766E | Teal – buttons, active nav, accents |
| Accent | #22D3EE | Cyan |
| Success | #16A34A | — |
| Warning | #F59E0B | — |
| Danger | #DC2626 | Delete actions |
| Background | #F8FAFC | Page background |
| Card | #FFFFFF | Card background |
| Border | #E5E7EB | Borders |

---

## Components Used

- **FullCalendar:** Calendar (dayGrid, timeGrid, interaction)
- **Lucide:** Icons
