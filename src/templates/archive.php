<?php
/**
 * The template for displaying archive pages.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

get_header();
?>

<div class="siteWrapper-archive">
	<div id="content-wrapper" class="contentWrapper" tabindex="-1">
		<main id="main" class="siteMain">
			<?php
			if ( have_posts() ) :
				while ( have_posts() ) :
					the_post();
					// Load partial-templates for archive.
					get_template_part( 'partial-templates/post/content', get_post_format() );
				endwhile;
			else :
					// Load partial-templates for empty content.
					get_template_part( 'partial-templates/post/content', 'none' );

			endif;
			?>
		</main><!-- #main -->

		<!-- The pagination component -->
		<?php {{theme.slugfn}}_pagination(); ?>

	</div><!-- #content -->

	<?php get_sidebar(); ?>
</div><!-- #content-wrapper -->

<?php get_footer(); ?>
