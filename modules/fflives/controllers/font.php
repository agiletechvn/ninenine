<?php

/*
 * Copyright 2016 tupt.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class FontController extends FFlivesController {

    function index() {
        $t = '{
  "Your Files": [],
  "Sans Serif": [
    {
      "name": "Arial",
      "filepath": ""
    },
    {
      "name": "Abel",
      "filepath": "abel/Abel-Regular"
    },
    {
      "name": "Acme",
      "filepath": "acme/Acme-Regular"
    },
    {
      "name": "Droid Sans",
      "filepath": "droidsans/DroidSans"
    },
    {
      "name": "Economica",
      "filepath": "economica/Economica-Regular"
    },
    {
      "name": "Lato",
      "filepath": "lato/Lato-Regular"
    },
    {
      "name": "Open Sans",
      "filepath": "opensans/OpenSans-Regular"
    },
    {
      "name": "Oswald",
      "filepath": "oswald/Oswald-Regular"
    },
    {
      "name": "PT Sans Narrow",
      "filepath": "ptsansnarrow/PT_Sans-Narrow-Web-Regular"
    },
    {
      "name": "PT Sans",
      "filepath": "ptsans/PT_Sans-Web-Regular"
    },
    {
      "name": "PT Mono",
      "filepath": "ptmono/PTM55FT"
    },
    {
      "name": "Ubuntu Condensed",
      "filepath": "ubuntucondensed/UbuntuCondensed-Regular"
    }
  ],
  "Serif": [
    {
      "name": "Andada",
      "filepath": "andada/Andada-Regular"
    },
    {
      "name": "Droid Serif",
      "filepath": "droidserif/DroidSerif"
    },
    {
      "name": "Gentium Book Basic",
      "filepath": "gentiumbookbasic/GenBkBasR"
    },
    {
      "name": "Josefin Slab",
      "filepath": "josefinsans/JosefinSans-Regular"
    },
    {
      "name": "IM Fell English",
      "filepath": "imfellenglish/IMFeENrm28P"
    },
    {
      "name": "Merriweather",
      "filepath": "merriweather/Merriweather-Regular"
    },
    {
      "name": "Old Standard TT",
      "filepath": "oldstandardtt/OldStandard-Regular"
    },
    {
      "name": "PT Serif",
      "filepath": "ptserif/PT_Serif-Web-Regular"
    },
    {
      "name": "Playfair Display",
      "filepath": "playfairdisplay/PlayfairDisplay-Regular"
    },
    {
      "name": "Vollkorn",
      "filepath": "vollkorn/Vollkorn-Regular"
    }
  ],
  "Display": [
    {
      "name": "Abril Fatface",
      "filepath": "abrilfatface/AbrilFatface-Regular"
    },
    {
      "name": "Bubblegum Sans",
      "filepath": "bubblegumsans/BubblegumSans-Regular"
    },
    {
      "name": "Cabin Sketch",
      "filepath": "cabinsketch/CabinSketch-Regular"
    },
    {
      "name": "Chelsea Market",
      "filepath": "chelseamarket/ChelseaMarket-Regular"
    },
    {
      "name": "Codystar",
      "filepath": "codystar/Codystar-Regular"
    },
    {
      "name": "Comfortaa",
      "filepath": "comfortaa/Comfortaa-Regular"
    },
    {
      "name": "Emilys Candy",
      "filepath": "emilyscandy/EmilysCandy-Regular"
    },
    {
      "name": "Gravitas One",
      "filepath": "gravitasone/GravitasOne"
    },
    {
      "name": "Jolly Lodger",
      "filepath": "jollylodger/JollyLodger-Regular"
    },
    {
      "name": "Lobster",
      "filepath": "lobster/Lobster"
    },
    {
      "name": "Londrina Shadow",
      "filepath": "londrinashadow/LondrinaShadow-Regular"
    },
    {
      "name": "Londrina Solid",
      "filepath": "londrinasolid/LondrinaSolid-Regular"
    },
    {
      "name": "Love Ya Like a Sister",
      "filepath": "loveyalikeasister/LoveYaLikeASister"
    },
    {
      "name": "Mystery Quest",
      "filepath": "mysteryquest/MysteryQuest-Regular"
    },
    {
      "name": "Supermercado One",
      "filepath": "supermercadoone/SupermercadoOne-Regular"
    }
  ],
  "Handwriting": [
    {
      "name": "Aladin",
      "filepath": "aladin/Aladin-Regular"
    },
    {
      "name": "Amatic SC",
      "filepath": "amaticsc/AmaticSC-Regular"
    },
    {
      "name": "Architects Daughter",
      "filepath": "architectsdaughter/ArchitectsDaughter"
    },
    {
      "name": "Arizonia",
      "filepath": "arizonia/Arizonia-Regular"
    },
    {
      "name": "Bilbo Swash Caps",
      "filepath": "bilboswashcaps/BilboSwashCaps-Regular"
    },
    {
      "name": "Delius Swash Caps",
      "filepath": "deliusswashcaps/DeliusSwashCaps-Regular"
    },
    {
      "name": "Italianno",
      "filepath": "italiana/Italiana-Regular"
    },
    {
      "name": "Maiden Orange",
      "filepath": "maidenorange/MaidenOrange"
    },
    {
      "name": "Ruge Boogie",
      "filepath": "rugeboogie/RugeBoogie-Regular"
    }
  ]
}';


        $font = json_decode($t, true);
        $font_path = 'fflives/images/embellishment/font/';
        $font_path_root = THEME_PATH . $font_path;
        foreach ($font as $font_collection) {
            foreach ($font_collection as $font_item) {
                if ($font_item['filepath']) {
                    $font_file = $font_path_root . $font_item['filepath'] . '.ttf';
                    if (file_exists($font_file)) {
                        // update for this item
                        $data = array(
                            'font_family' => $font_item['name'],
                            'type' => '2',
                            'font_file_oet' => $font_path . $font_item['filepath'] . '.oet',
                            'font_file_svg' => $font_path . $font_item['filepath'] . '.svg',
                            'font_file_ttf' => $font_path . $font_item['filepath'] . '.ttf',
                            'font_file_woff' => $font_path . $font_item['filepath'] . '.woff'
                        );
                        db_insert('tbl_embellishment', $data);
                        echo $font_path . $font_item['filepath'] . '.ttf<br/>';
                    }
                } else {
                    $data = array(
                        'font_family' => $font_item['name'],
                        'type' => '2'
                    );
                    db_insert('tbl_embellishment', $data);
                }
            }
        }

//        $this->json($font);
    }

    function fix1() {
//        $fonts = db_select('tbl_embellishment', '*', array('type' => 2, 'font_file_eot != ""'));
//        foreach ($fonts as $v) {
//            $path = str_replace(array('.oet', '.eot'), '', $v['font_file_eot']);
//            db_update('tbl_embellishment', array(
//                'font_file_svg' => $path . '.svg',
//                'font_file_ttf' => $path . '.ttf',
//                'font_file_woff' => $path . '.woff'
//                    ), array('id' => $v['id']));
//        }
//        $this->json($fonts);
    }

    function fix() {
//        $embellishment_data = [
//           
//        '6'=>["36466833", "36466843", "36466866", "36466840", "36466852", "36466859", "36466861", "36466874", "36466846", "36466879", "36466832", "36466855", "36466853", "36466864", "36466845", "36466871", "36466863", "36466889", "36466862", "36466828", "36466891", "36466849", "36466882", "36466883", "36466820", "36466876", "36466848", "36466851", "36466835", "36466869", "36466826", "36466850", "36466854", "36466830", "36466842"],
//        '7' =>["34185809", "34185761", "34185728", "34185782", "34185756", "34185735", "34185718", "34185743", "34185746", "34185765", "34185793", "34185815", "34185771", "34185802", "34185798", "34185723", "34185752", "34185775", "34186542", "34186624", "34186547", "34186645", "34186636", "34186534", "34186538", "34186580", "34186595", "34186643", "34186573", "34186566", "34186532", "34186640", "34186604", "34186553", "34186613"],
//        '8'=>["34591317", "34591151", "34591347", "34591336", "34591166", "34591157", "34591621", "34591607", "34591618", "34591611", "34591645", "34591630", "34227243", "34227235", "34592005", "34592000", "34591980", "34591971", "34592013", "34591987", "34227252", "34591995", "34592045", "34592023", "34227259", "34227270", "34592031", "34591190", "34591180", "34591185", "34591563", "34591578", "34591651", "34591659", "34591663"]
//   
//        ];
//
//        foreach ($embellishment_data as $type => $row) {
//            if ($type == '3') {
//                foreach ($row as $v) {
//                    $data = array(
//                        'type' => '3',
//                        'color' => $v
//                    );
//                    db_insert('tbl_embellishment', $data);
//                }
//            } else {
//                foreach ($row as $v) {
//                    $data = array(
//                        'type' => $type,
//                        'main_img' => "themes/fflives/images/embellishment/data/$type/$v.png",
//                        'thumb_img' => "themes/fflives/images/embellishment/data/$type/thumb/$v.jpg"
//                    );
//                    db_insert('tbl_embellishment', $data);
//                }
//            }
//        }
    }

}
