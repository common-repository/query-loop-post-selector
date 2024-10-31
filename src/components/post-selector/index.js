/**
 * WordPress Dependencies
 */
import { useSelect } from '@wordpress/data';
import { safeHTML } from '@wordpress/dom';
import { __, sprintf } from '@wordpress/i18n';
import { toString, capitalize, unescape } from 'lodash';
import { useState, useEffect } from '@wordpress/element';
import { FormTokenField, Spinner } from '@wordpress/components';

/**
 * A custom post selector component that renders a search bar
 * along with a dropdown so user can select posts leveraging the LinkControl behind the scenes.
 */
function PostSelector(props) {
	const [search, setSearch] = useState('');
	const [selectedPosts, setSelectedPosts] = useState([]);

	const { posts } = useSelect(
		(select) => {
			const selectorArgs = [
				'postType',
				props.postType,
				{ search, search_columns: ['post_title'] },
			];

			return {
				posts: select('core').getEntityRecords(...selectorArgs),
			};
		},
		[search, props.postType]
	);

	const decodeHtmlEntity = (string) => unescape(safeHTML(string));

	const finalPosts = Array.isArray(posts) ? posts : [];
	const postIds = finalPosts.map((post) => post?.id);

	const postTitles = finalPosts
		.map((post) => post?.title?.rendered)
		.map(decodeHtmlEntity);

	const selectedPostsTitles = props.value
		.map((post) => post.title)
		.map(decodeHtmlEntity);

	const normalizedPostType = capitalize(props.postType);

	return (
		<div className="qlpsp-post-selector">
			<FormTokenField
				suggestions={postTitles}
				value={selectedPostsTitles}
				__experimentalExpandOnFocus
				__experimentalShowHowTo={false}
				__experimentalRenderItem={({ item }) => {
					return <span>{decodeHtmlEntity(item)}</span>;
				}}
				onInputChange={setSearch}
				label={normalizedPostType}
				placeholder={sprintf(
					__('Select %s', 'query-loop-post-selector'),
					props.postType
				)}
				onChange={(newSelectedPostTitles) => {
					const withIds = newSelectedPostTitles.map((postTitle) => {
						const isAlreadyAdded = props.value.find(
							(post) => post?.title === postTitle
						);

						if (isAlreadyAdded) {
							return isAlreadyAdded;
						}

						const fullPost = posts.find(
							(post) =>
								decodeHtmlEntity(post?.title?.rendered) ===
								postTitle
						);

						return {
							title: postTitle,
							id: fullPost?.id,
						};
					});
					props.onChange(withIds);
				}}
			/>
		</div>
	);
}

export default PostSelector;
