import React, { useState, useCallback } from 'react';
import {
  DataGrid,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Typography,
  Paper,
  Popper,
  Fade,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert
} from '@mui/material';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Create a theme to match the clean, modern look
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

const initialRows = [
  { id: 1, name: 'John Doe', age: 25, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 'Invalid Age', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 30, email: 'bob' }, // Invalid email
  { id: 4, name: 'Alice Brown', age: 22, email: 'alice@example.com' },
  { id: 5, name: 'Charlie Green', age: 15, email: 'charlie@example.com' },
];

export default function App() {
  const [activeCell, setActiveCell] = useState(null);
  const [errors, setErrors] = useState([]);
  const [rows, setRows] = useState(initialRows);
  const [successOpen, setSuccessOpen] = useState(false);
  
  // To anchor the error message to the specific cell element
  const [anchorEl, setAnchorEl] = useState(null);

  const handleCellClick = useCallback((params, event) => {
    setActiveCell({ id: params.id, field: params.field });
    setAnchorEl(event.currentTarget);
  }, []);

  const validateCell = () => {
    if (!activeCell) return;

    // 1. 先清空所有其他单元格的错误信息
    setErrors([]);

    const row = rows.find((r) => r.id === activeCell.id);
    if (!row) return;

    const field = activeCell.field;
    const value = row[field];
    let errorMessage = '';

    // Custom validation logic
    if (field === 'age') {
      if (isNaN(Number(value))) {
        errorMessage = '校验失败，需输入数字类型';
      } else if (Number(value) < 18) {
        errorMessage = '校验失败，年龄必须大于18岁';
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        errorMessage = '校验失败，需输入有效的邮箱格式';
      }
    } else if (field === 'name') {
      if (!value || String(value).length < 2) {
        errorMessage = '校验失败，姓名长度需大于2位';
      }
    }

    if (errorMessage) {
      // 校验失败：设置当前单元格错误
      setErrors([{ ...activeCell, message: errorMessage }]);
    } else {
      // 校验成功：开启成功提示
      setSuccessOpen(true);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: '姓名', width: 150, editable: true },
    { field: 'age', headerName: '年龄', width: 120, editable: true },
    { field: 'email', headerName: '邮箱', width: 220, editable: true },
  ];

  // Logic to determine if a cell is currently in an error state
  const getCellError = (id, field) => {
    return errors.find((e) => e.id === id && e.field === field);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4, height: '100vh', display: 'flex', flexDirection: 'column', gap: 3, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              单元格手动校验逻辑优化
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              点击校验按钮将清空历史错误。若当前单元格合规，将展示成功提示。
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setErrors([]);
                setActiveCell(null);
                setAnchorEl(null);
              }}
              sx={{ borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}
            >
              重置状态
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle2 size={18} />}
              onClick={validateCell}
              disabled={!activeCell}
              sx={{ boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.2)' }}
            >
              校验选中单元格
            </Button>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ flexGrow: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            onCellClick={handleCellClick}
            processRowUpdate={(newRow) => {
              setRows(rows.map(r => r.id === newRow.id ? newRow : r));
              return newRow;
            }}
            getCellClassName={(params) => {
              const error = getCellError(params.id, params.field);
              const isActive = activeCell?.id === params.id && activeCell?.field === params.field;
              let classes = '';
              if (error) classes += ' cell-error';
              if (isActive) classes += ' cell-active';
              return classes;
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              },
              '& .cell-error': {
                backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                color: '#ef4444 !important',
              },
              // 关键修复：增加权重并使用 box-shadow 确保边框在点击时立即显示
              '& .MuiDataGrid-cell.cell-active': {
                boxShadow: 'inset 0 0 0 2px #2563eb !important',
                outline: 'none !important',
                zIndex: 1,
              },
              // 移除默认的单元格点击轮廓，防止干扰
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none !important',
              },
            }}
            hideFooterSelectedRowCount
          />

          {/* Validation Error Popper */}
          <Popper
            open={!!activeCell && !!getCellError(activeCell.id, activeCell.field)}
            anchorEl={anchorEl}
            placement="right-start"
            transition
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 0],
                },
              },
              {
                name: 'flip',
                enabled: true,
              },
              {
                name: 'preventOverflow',
                enabled: true,
                options: {
                  boundary: 'viewport',
                },
              },
            ]}
            sx={{ zIndex: 1300, pointerEvents: 'none' }}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={200}>
                <Paper
                  elevation={0}
                  sx={{
                    p: '12px 16px',
                    bgcolor: '#fff59d',
                    border: '1px solid #fbc02d',
                    borderLeft: 'none',
                    borderRadius: 0,
                    maxWidth: 300,
                    minHeight: 52,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AlertCircle size={16} color="#f57f17" style={{ flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#5f430b', fontWeight: 500 }}>
                      {activeCell ? getCellError(activeCell.id, activeCell.field)?.message : ''}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Paper>

        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: '#fee2e2',
                  borderColor: '#fecaca',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <AlertCircle size={24} color="#ef4444" />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#991b1b', fontWeight: 600 }}>
                    校验未通过
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b91c1c' }}>
                    单元格数据不符合业务规范，请修正。
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* 校验通过 Snackbar 提示 */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          校验通过
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
