<?php

function extract_div($content, $div_id){
	// Prepare to match the DIV tag
    // Credit to: http://stackoverflow.com/questions/5355452/using-a-regular-expression-to-match-a-div-block-having-a-specific-id
    $re = '% # Match a DIV element having id="content".
        <div\b             # Start of outer DIV start tag.
        [^>]*?             # Lazily match up to id attrib.
        \bid\s*+=\s*+      # id attribute name and =
        ([\'"]?+)          # $1: Optional quote delimiter.
        \b' . $div_id . '\b        # specific ID to be matched.
        (?(1)\1)           # If open quote, match same closing quote
        [^>]*+>            # remaining outer DIV start tag.
        (                  # $2: DIV contents. (may be called recursively!)
          (?:              # Non-capture group for DIV contents alternatives.
          # DIV contents option 1: All non-DIV, non-comment stuff...
            [^<]++         # One or more non-tag, non-comment characters.
          # DIV contents option 2: Start of a non-DIV tag...
          | <            # Match a "<", but only if it
            (?!          # is not the beginning of either
              /?div\b    # a DIV start or end tag,
            | !--        # or an HTML comment.
            )            # Ok, that < was not a DIV or comment.
          # DIV contents Option 3: an HTML comment.
          | <!--.*?-->     # A non-SGML compliant HTML comment.
          # DIV contents Option 4: a nested DIV element!
          | <div\b[^>]*+>  # Inner DIV element start tag.
            (?2)           # Recurse group 2 as a nested subroutine.
            </div\s*>      # Inner DIV element end tag.
          )*+              # Zero or more of these contents alternatives.
        )                  # End 2$: DIV contents.
        </div\s*>          # Outer DIV end tag.
        %isx';
    
    if (preg_match($re, $content, $matches))
    	return  $matches[0];
}