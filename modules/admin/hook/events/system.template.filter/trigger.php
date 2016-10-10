<?php

function concat($value, $str) {
    return $value . $str;
}
$args['concat'] = 'concat';

function options($value, $checked, $key_field, $value_field){
    $ret = '';
    foreach($value as $key=>$option){
        // default key is the order,better than just option value itself, we can retrieve later
        $key_value = ($key_field ? $option[$key_field] : $key);
        $ret .= '<option value="' . $key_value . '"';
        if(in_array($key_value, $checked))
            $ret .= 'selected="selected"';
        $ret .= '>' . ($key_field ? $option[$value_field] : $option) . '</option>';
    }
    return $ret;
}

function form($value, $label=null, $name=null){
    
    if(empty($label))
        return '</form></div>';
    
    return '<div class="form-title">
             <i class="icon-reorder"></i>&nbsp;' . t($value ? 'Sửa' : 'Thêm') . ' ' . $label . '</div>     
	     <div class="widget-body">     
	         <form class="admin-form form-horizontal" >
		         <input type="hidden" value="' . $value . '" name="' . $name . '" />';
}
$args['form'] = 'form';

/**
 * in a request, template will run in order, so we use static to store previous value
 * dont care too much about empty, ! or isset, almost the same speed for instructions
 * @param type string
 */
function tabs($value, $tab_options, $class_desktop='tabs-left', $class_tablet='tabs-left', $class_phone='') {
    
    static $hash_tabs;
    static $current_tabs;
    static $first_tab;
    
    // short code for current tab, shift args manually for three params :D
    if(is_numeric($value)){
        $class = $tab_options;
        $tab_options = $value;
        $value = $current_tabs;
    }
    
    if(!isset($tab_options)){
        // close tab
        unset($hash_tabs[$value]);
        return '</div></div></div>';
    } 
    $html = '';
    if(is_numeric($tab_options)){
        $keys = array_keys($hash_tabs[$value]);
        if($first_tab)
            $first_tab = false;
        else 
            $html .= '</div>';
        
        $html .= '<div class="';
        // first tab, show it
        if($tab_options === 0)
            $html .= 'active ';
        // class for a tab-pane
        if(!empty($class))
            $html .= $class . ' ';
        $html .= 'tab-pane" id="'. $keys[$tab_options] .'">';
    } elseif(is_string($tab_options)){
        // get next value until the next key, but don't grap this key for next match
        if(preg_match_all('/([a-zA-Z_0-9]+)\s*=\s*(.*?)\s*(?=,[a-zA-Z_0-9]+=|$)/', 
                $tab_options, $matches)){
            // this is the first time access tabs function
            $first_tab = true;
            // make pointer to current_tabs;
            $hash_tabs[$current_tabs = $value] = array_combine($matches[1], $matches[2]);
            
            
            if(count($hash_tabs[$value]) === 1)
                $class .= ' hide-one'; // can override
            
            foreach($hash_tabs[$value] as $tab_key => $tab_value)
                $html .= (empty($html)
                    ? ('<div class="tabbable tabbable-custom responsive'. $class . ' ' . $class_desktop.'" data-desktop="'. 
                        $class_desktop .'" data-tablet="'.$class_tablet.'" data-phone="'.$class_phone.
                        '"><ul class="nav nav-tabs"><li class="active">')
                    : '<li>')
                    .  '<a href="#'.$tab_key.'" data-toggle="tab">'.t($tab_value).'</a>' ;    

            $html   .= '</ul><div class="tab-content">';
        }
    }
    return $html;
}

$args['tabs'] = 'tabs';

function control($value, $label, $name, $ui_type) {
    // these are attritube that occur through all controls
    // so other attr must be assign to prevent error occur
    $help = '';
    $attr = '';
    $end = false;
    $wrap = true;
    $class = 'input-xxlarge';
    // prepend or append for more detail information
    $control_wrap_class = 'input-wrapper';
    $control_wrap_attr = '';
    // the forth param may be array, if it is, ignore all after
    // else gather all params start from it, because from ui-type, those are custom attributes
    if(is_array($ui_type)){
        $attr_array = $ui_type;
        $ui_type = array_shift($attr_array);
    } else 
        $attr_array = array_slice(func_get_args(), 4);
    // this is for empty ui-type from array, or from template
    if(empty($ui_type))
        $ui_type = 'text';
    // else already array
   foreach($attr_array as $attr_val) {
        if ($attr_val == 'end')
            $end = true;
        else {

            list($k, $v) = explode('=', $attr_val, 2);
            switch($k){
                // for checkbox
                case 'checked':
                    $checked = $v;
                    break;
                // we don't use special attribute like key, value of cousre    
                case 'key':
                    $key_field = $v;
                    break;
                case 'value':
                    $value_field = $v;
                    break;
                case 'group-key':
                    $group_key_field = $v;
                    break;
                case 'group-value':
                    $group_value_field = $v;
                    break;
                case 'prepend':
                    $prepend = $v;
                    break;
                case 'append':
                    $append = $v;
                    break;
                case 'help':
                    $help = $v;
                    break;
                // for class
                case 'class':
                    $class = $v;
                    break;
                default:
                    // convert double quote
                    $attr .= $k . '="' . htmlspecialchars($v, ENT_COMPAT) . '" ';
                    break;

            }

        }
    }         
        
    // don't support insesitive string for faster render
    // lower attribute for better view
    // $attr = strtolower($attr);
    
    switch ($ui_type) {
        case 'action':
            $control = $label . '<div class="row-action" data-id="' . $value . '">';
            // prepend, no need to set it at the top, to save memory, allocate on the fly
            if(isset($prepend)){
                $control .= $prepend . '&nbsp;';
                // tell the last code not to append
                unset($prepend);
            }
            // then edit and delete action by default, no need for view :D
            list($edit_name, $delete_name) = explode(',', $name);
            $edit_name = trim($edit_name);
            if($edit_name)
                $control .= '<a data-target="#add-modal" href="' . LANGUAGE . '/admin/' .
                    Router::$hook_module . '/' . Router::$controller . '/add/' . $value . '" '
                    . 'no-push role="button" data-toggle="modal" data-modal="0" toggle-mode="0" class="btn btn-primary mini purple">'
                    .'<i class="icon-edit"></i> ' . t($edit_name) . '</a>';
            $delete_name = trim($delete_name);
            if($delete_name)
                $control .= '&nbsp;<a data-target="#del-modal" no-push data-show="1" data-toggle="modal" data-modal="0" '
                    . 'data-id="' . $value . '" class="btn btn-danger mini black">'
                    . '<i class="icon-trash"></i> ' . t($delete_name) . '</a>';
            // finally append here
            if(isset($append)){
                $control .= '&nbsp;' . $append;
                unset($append);
            }
            $control .= '</div>';
            $wrap = false;
            break;
        case 'form':
            $control = form($value, $label, $name);
            $wrap = false;
            break;
        case 'textarea':
        case 'autogrow':
        case 'ckeditor':
            $control = '<textarea class="'. $class . '" name="' . $name . '"';
            if($ui_type !== 'textarea')
                $control .= 'ui-type="' . $ui_type . '"';
                    $control .= ' '. $attr . '>' . $value . '</textarea>';
            break;
        // input text then preview below
        case 'gmap':
        case 'qrcode':
            // some control must stretch to parent size, so you can use class for input to stretch also
            // or modified existed class base on its name or it parent class name
            $control = '<div ui-type="' . $ui_type . '" ' . $attr . '>
                <input type="text" name="' . $name . '" value="' . $value . '" class="'. $class .'"/>
                    <br/><div class="' . $ui_type . 's"></div>
                    </div>';
            break;
        case 'slider':
            // don't use input directly, 'cos input is hard to markup, and can't track render
            $control = '<div class="'. $class .'" ui-type="slider" ' . $attr . '><input type="slider" name="' . $name . '" value="'.$value.'" style="display: none"/></div>';
            break;
        case 'select':
        case 'chosen-select':
            $control = '<select class="'. $class .'" name="' . $name . '"';
            // mark data-checked for later use, must provide checked value or error will be promed
            if($ui_type !== 'select')
                $control .= ' ui-type="' . $ui_type . '" data-checked="' . $checked . '" data-key="'
                             . $key_field . '" data-value="' . $value_field . '" data-group-key="'
                             . $group_key_field . '" data-group-value="' . $group_value_field . '" '
                    . $attr . '>';
          
            // check contain data-placeholder then make an empty option first
            if(strpos($attr, 'data-placeholder') !== false)
                $control .= '<option value=""></option>';
            // make checked as array of value
            $checked = explode(',', $checked);
            // to many line of codes. use braces for better view
            if(isset($group_key_field)){
                foreach($value  as $sub_value)
                    if (count($group_value = $sub_value[$group_value_field]) > 0 && ($group_title = $sub_value[$group_key_field]))
                       $control .= '<optgroup label="'.$group_title.'">'
                                . options($group_value, $checked, $key_field, $value_field)
                                . '</optgroup>';
            } else 
                $control .= options($value, $checked, $key_field, $value_field);     
            
            $control .= '</select>';
            break;
        case 'toggle-button':
            $control = '<div class="success-toggle-button center" ' . $attr .
                    'ui-type="toggle-button"><input class="toggle" name="' . $name . '" type="checkbox"';
            // support conversion
            if ($value == $checked)
                $control .= 'checked="checked"';
            $control .= '/></div>';
            break;
        case 'group-button':
            // we don't support group-button with checkbox like multi select
            // in this case, you should move to chosen-select
            $control = '<div class="btn-group ' . $class . '" ui-type="group-button" ' . $attr . '>';
            $value_field = str_getcsv($value_field);
            $len = count($value_field);
            $key_field = isset($key_field) ? str_getcsv($key_field) : range(0, $len - 1);
            // by default we use value as checked
            if(!isset($checked))
                $checked = $value;
            // even button tag should define type="button" for discriminate between submit and button
            for($ind=0;$ind<$len;$ind++){
                $control .= '<button type="button" class="btn';
                // checked should check by conversion, not by same type
                if($checked == $key_field[$ind])
                    $control .= ' active';
                
                $control .= '" value="' . $key_field[$ind]. '">'
                            . $value_field[$ind] . '</button>';
            }
            $control .= '<select class="hidden" name="'.$name.'"></select></div>';
            break;
        case 'date-picker':
            $control = '<div ui-type="date-picker" class="input-append date '. $class .'"' . $attr .
                    'data-date="' . $value . '" >' .
                    '<input name="' . $name . '" class="m-ctrl-medium" size="16" type="text"' .
                    ' value="' . $value . '" /><span class="add-on"><i class="icon-calendar"></i></span>
                    </div>';
            break;
        // so short no need to group them
        case 'time-picker':
            $control = '<div ui-type="time-picker" class="input-append time '. $class .'"' . $attr .
                    'data-time="' . $value . '" >' .
                    '<input name="' . $name . '" class="m-ctrl-medium" size="16" type="text"' .
                    ' value="' . $value . '" /><span class="add-on"><i class="icon-time"></i></span>
                    </div>';
            break;
        // need two params split by comma, not like gmap control the main input is address, we need two inputs
        // and these inputs are inside control, so we don't have to use parent selector outside
        case 'date-range-picker':
            list($name1, $name2) = explode(',', $name);
            list($value1, $value2) = explode(',', $value);
            $control = '<div ui-type="date-range-picker" parent-el="#add-modal .modal-body" start-date-el="[name='.$name1.']"
                 	 end-date-el="[name='.$name2.']" class="btn date-range-picker '. $class .'"' . $attr .  
	                 '><i class="icon-calendar"></i> &nbsp;<span></span>&nbsp;<b class="caret"></b>
	                 <input type="hidden" value="'.$value1.'" name="'.$name1.'" />
	                 <input type="hidden" value="'.$value2.'" name="'.$name2.'" />
	             </div>';
            break;
        case 'color-picker':
            $control = '<div ui-type="color-picker" class="input-append color colorpicker-default '. $class .'"' . $attr .' >' .
                    '<input name="' . $name . '" type="text"' .
                    ' value="' . $value . '" /><span class="add-on"><i style="background-color:'.$value.'"></i></span>
                    </div>';
            break;
        case 'fileupload':
            // should override inline css ?, in css file with !important
            // css class use for both control and progress bar to keep same width, 
            // you can use 2 classes together to style for each item
            $control = '<div class="fileupload fileupload-new '. $class .'" ui-type="fileupload" '. $attr .'>
				    <div class="fileupload-new thumbnail">'.$value.'</div>
				    <div class="fileupload-preview fileupload-exists thumbnail">
			        </div><div><span class="btn btn-file">
		                    <span class="fileupload-new">Select</span>
		                    <span class="fileupload-exists">Change</span>
		                    <input name="'.$name.'" type="file" class="default" />
		                </span>&nbsp;<a href="#" class="btn fileupload-exists" data-dismiss="fileupload">Remove</a>
		            </div><br/><div class="progress-report">
			            <div class="label label-info progress-report-name"></div>
			            <div class="label label-success progress-report-status"></div>
			            <div class="'. $class .'"><div class="progress progress-striped active">
	                            <div class="bar progress-report-bar"></div>
	                        </div></div></div></div>';
            break;
        case 'filesupload': // require-visible will make site runs faster 'cos we load data on demand, but not good for ux
            $control .= '<div ui-type="filesupload" ' . $attr . '>
     <div class="fileupload-buttonbar">
      <div class="span7">
          <span class="btn btn-success fileinput-button">
              <i class="icon-plus icon-white"></i>&nbsp;<span>'.t('Add Image').'...</span>
              <input type="file" name="'.$name.'[]" multiple />
          </span>&nbsp;
          <button type="submit" class="btn btn-primary start">
              <i class="icon-upload icon-white"></i>&nbsp;<span>'.t('Upload All').'</span>
          </button>&nbsp;
          <button type="reset" class="btn btn-warning cancel">
              <i class="icon-ban-circle icon-white"></i>&nbsp;<span>'.t('Cancel').'</span>
          </button>&nbsp;
          <button type="button" class="btn btn-danger delete">
              <i class="icon-trash icon-white"></i>&nbsp;<span>'.t('Delete').'</span>
          </button>&nbsp;
          <input type="checkbox" class="toggle">
          <span class="fileupload-loading"></span>
      </div>
      <div class="span5 note"></div>
      <div class="span4 fileupload-progress fade">
          <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
              <div class="bar" style="width:0%;"></div>
          </div><div class="progress-extended">&nbsp;</div>
      </div>
  </div>
  <div role="presentation" ui-type="fancy-box" class="row-fluid files span12"></div>
  </div>';
            break;
        // other ui-type that use dive and hidden input should put here
        case 'excel':
            $control = '<div class="'. $class .'" require-visible ui-type="' . $ui_type . '"';
            // is array
            if(is_array($value)){
                // has cols
                if(isset($value['cols']))
                    $control .= ' data-col-headers="'.  htmlspecialchars(is_array($value['cols']) 
                            ? json_encode($value['cols']) 
                            : $value['cols']) . '"';
                // has rows, then encode rows
                if(isset($value['rows']))
                    $json_value = htmlspecialchars(is_array($value['rows']) 
                            ? json_encode($value['rows']) 
                            : $value['rows']);
                else // if has only cols but not rows, default is empty [], other is value
                   $json_value = isset($value['cols']) ? '[]' : htmlspecialchars(json_encode($value));
                        
            } else // is string
                $json_value = empty($value) ? '[]' : htmlspecialchars($value); // no row
            
            $control .= ' data-data="' . $json_value .'" ' . $attr . 
                    '></div><input type="hidden" name="' . $name . '" />';
            break;
        // some ui-type that use input type=text should put here
        case 'tags-input':
            // always use wrap for style control, not style plain input
            $control_wrap = true;
            // should style input in wrap by css of parent
            $control_wrap_class .= ' ' . $class;
            $control = '<input name="' . $name . '" type="text" value="' . $value . '"';    
            if(isset($prepend) || isset($append)) 
                // we use component, so move config to wrap    
                $control_wrap_attr  = 'ui-type="' . $ui_type . '" ' . $attr;
            else
                $control .= ' ui-type="' . $ui_type . '" ' . $attr; 
            // close tag
            $control .= ' />';  
            break;
        default:   
            // other simple ui-type based on simple input, just add ui-type as an attribute
            $control = '<input class="'. $class .'" name="' . $name . '" type="' . $ui_type . '" value="' . $value . '" ' . $attr . ' />';  
            break;
    }
    // override by inline style is the better choice rather than customize control wrapper tag in detail
    // let client do that, we know that isset is the fastest, more than empty or bool check
    if(isset($prepend)){
        $control = '<span class="add-on">' . $prepend . '</span>' . $control;
        $control_wrap_class .= ' input-prepend';
        $control_wrap = true;
    }
    
    if(isset($append)){
        $control .= '<span class="add-on">' . $append . '</span>';
        $control_wrap_class .= ' input-append';
        $control_wrap = true;
    }
    
    if($control_wrap){
        $control = '<div class="' . $control_wrap_class . '" ' .
                $control_wrap_attr . '>' . $control . '</div>';      
    }
    
    // even in span, we can use html structure block
    if($help)
         $control .= '<span class="help-block">'. $help . '</span>';
    
    
    // don't translate label, it is general use, for menu name, translation is good place
    if ($wrap)
        $str = '<div class="control-group">
		             <label class="control-label">' . $label . '</label>
		             <div class="controls">' .
                $control .
                '<span class="help-inline" err-for="' . $name . '"></span>                           
		             </div>
		         </div>';
    else
        $str = $control;
    
    // endform here
    if($end)
        $str .= form($value);

    return $str;
}

$args['control'] = 'control';
