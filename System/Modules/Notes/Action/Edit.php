<?php

/**
 * DreamCMS 3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * PHP Version 5
 *
 * @package      Notes
 * @version      3.0.0 Beta
 * @category     Action
 * @copyright    2008-2013 Marcel Domke
 * @license      http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author       Marcel Domke <http://www.dcms-studio.de>
 * @link         http://www.dcms-studio.de
 * @file         Edit.php
 */
class Notes_Action_Edit extends Controller_Abstract
{

	public function execute ()
	{

		if ( $this->isFrontend() )
		{
			return;
		}


		$id  = (int)$this->_post('id');
		$str = $this->db->compile_db_update_string(array (
		                                                 'x'       => (int)$this->_post('x'),
		                                                 'y'       => (int)$this->_post('y'),
		                                                 'userid'  => Session::get('userid'),
		                                                 'text'    => $this->_post('text'),
		                                                 'created' => TIMESTAMP
		                                           ));

		$this->db->query("UPDATE %tp%admin_notes SET {$str} WHERE id= ? AND userid = ?", $id, Session::get('userid'));


		echo Library::json(array (
		                         'success' => true,
		                         'id'      => $id,
		                         'date'    => date('d.m.Y, H:i', TIMESTAMP),
		                         'label'   => Strings::TrimHtml($this->_post('text'), 30, null)
		                   ));
		exit;
	}

}
