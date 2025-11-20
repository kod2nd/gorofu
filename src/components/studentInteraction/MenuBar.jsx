import React, { useCallback } from 'react';
import { Box, Tooltip, IconButton, Divider } from '@mui/material';
import {
  FormatBold, FormatItalic, FormatUnderlined, Link as LinkIcon,
  FormatListBulleted, FormatListNumbered
} from '@mui/icons-material';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const buttonStyle = {
    minWidth: '40px',
    height: '40px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    '&.is-active': {
      backgroundColor: 'primary.main',
      color: 'white',
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
    },
  };

  return (
    <Box sx={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      borderBottom: 0,
      borderRadius: '12px 12px 0 0',
      p: 1.5,
      display: 'flex',
      gap: 0.5,
      flexWrap: 'wrap'
    }}>
      <Tooltip title="Bold">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatBold fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Link">
        <IconButton
          size="small"
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <LinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Bullet List">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} sx={buttonStyle}>
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Numbered List">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} sx={buttonStyle}>
          <FormatListNumbered fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MenuBar;