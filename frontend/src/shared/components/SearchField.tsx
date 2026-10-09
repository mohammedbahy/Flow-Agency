import { InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchFieldProps
  extends Pick<TextFieldProps, 'value' | 'onChange' | 'placeholder' | 'fullWidth' | 'size'> {
  label?: string;
}

/** Shared search input with leading icon, per the Kinetic input style. */
export function SearchField({
  label = 'Search',
  placeholder,
  ...rest
}: SearchFieldProps) {
  return (
    <TextField
      placeholder={placeholder ?? label}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        },
        // Label the native input itself (icon-only field has no visible label).
        htmlInput: { 'aria-label': label },
      }}
      {...rest}
    />
  );
}

export default SearchField;
