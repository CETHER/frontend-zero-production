import Button from '../../atomic/atoms/Button';

export default {
	title: 'Atoms/Buttons',
	component: Button,
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});

Primary.args = {
	children: 'Primary',
};